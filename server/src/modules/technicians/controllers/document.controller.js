import pool from 
'#config/database/postgres.js';

import {
    ApiError,
    ApiResponse,
    asyncHandler,
    
    hasEmpty,
    isValidUUID,
    
    removeLocalFile,
    formatDocument
} from '#shared';

import {
    emailQueue,
    cleanupQueue
} from '#queues';

import {
    uploadOnCloudinary
} from '#services';


const uploadDocument = asyncHandler(async (req, res) => { 
    const technician = req.technician;

    if(!technician){
        throw new ApiError(
            404,
            "Technician account not found"
        );
    }

    const documentId = req.body?.documentId?.trim() || "";
    const documentName = req.body?.documentName?.trim() || "";
    const documentType = req.body?.documentType?.trim() || "";
    const expiryDate = req.body?.expiryDate;

    if( !documentName ||
        !documentType
    ){
        throw new ApiError(
            400,
            "Document name and type are required"
        );
    }

    const localPath = req.file?.path || "";
    if(!localPath){
        throw new ApiError(
            400,
            "Please upload a document"
        );
    } 

    const mime_type = req.file?.mimetype || "";

    const allowedDocumentTypes = [
        "license",
        "identity",
        "insurance",
        "certificate",
        "other",
    ];
    
    if(!allowedDocumentTypes.includes(documentType)){
        throw new ApiError(
            400,
            "Invalid document type"
        );
    }

    const uploadedDoc = await uploadOnCloudinary(localPath);
    if(!uploadedDoc){
        throw new ApiError(
            500,
            "Failed to upload document on cloudinary"
        );
    
    }
    let public_id = uploadedDoc.public_id;
    try{
        let query = `
            INSERT INTO technician_documents(
                technician_id,
                document_id,
                document_name,
                document_type,
                mime_type,
                public_id, 
                public_url,
                expiry_date
            )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;

        const values = [
            technician.id,
            documentId,
            documentName,
            documentType,
            mime_type,
            uploadedDoc.public_id,
            uploadedDoc.secure_url,
            expiryDate || null,
        ];

        let result = await pool.query(query,values);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Failed to upload document"
            )
        }
        
        const uploadedDocument = formatDocument(result.rows[0]);
        
        try{
            await emailQueue.add(
                "document:add",
                {
                    technicianId: technician.id,
                    documentId: uploadedDocument.id
                },
                {
                    jobId: `document:add:${uploadedDocument.id}`
                }
            );

            console.log("Document deletion email queued");
        }catch(err){
            console.error("Queue error:", err.message);
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    uploadedDocument,
                    "Document uploaded successfully"
                )
            );

    }catch(err){
        try{
            await cleanupQueue.add(
                "cloudinary:file:delete",
                {
                    public_id: public_id,
                    resourceType: "raw"
                },
                {
                    jobId: `cloudinary:file:delete:${public_id}`
                }
            );
            
            console.log("Document deletion is enqueued");
        }catch(err){
            console.error("Queue error:", err.message);
        }
    
         try{
            await deleteFromCloudinary(
                uploadedFile.public_id
            );
        }catch(_) {}

        throw new ApiError(
            err.statusCode || 500,
            err.message ||
            "Failed to upload document"
        );
    }
});

const updateDocument = asyncHandler(async (req,res) => {
    const technician = req.technician;
    const docId = req.params.docId;
    
});

const deleteDocument = asyncHandler(async (req, res) =>{ 
    const technician = req.technician;

    if(!technician){
        throw new ApiError(
            404,
            "Technician account not found"
        );
    }

    const docId = req.params?.docId || "";
    if(!docId || !(isValidUUID(docId))){
        throw new ApiError(
            400,
            "Invalid or missing document id"
        );
    }

    let query = `
        UPDATE technician_documents
            SET deleted_at = NOW()
        WHERE id = $1
            AND technician_id = $2
            AND deleted_at IS NULL;
    `;

    let result = await pool.query(
        query,
        [docId, technician.id]
    );

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Document not found"
        );
    }

    try{
        await cleanupQueue.add(
            "document:delete",
            {
                technicianId: technician.id,
                documentId: docId
            },
            {
                jobId: `document:delete:${docId}`
            }
        );
        
        console.log("Document deletion is enqueued");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    try{
        await emailQueue.add(
            "delete:document",
            {
                technicianId: technician.id,
                documentId: documentcId
            },
            {
                jobId: `document:deleted:${documentcId}`
            }
        );

        console.log("Document deletion email queued");
    }catch(err){
        console.error("Queue error:", err.message);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Document deleted successfully."
            )
        );

});

const verifyDocument = asyncHandler(async (req, res) =>{ });

export {
    uploadDocument,
    updateDocument,
    deleteDocument,
    verifyDocument
};