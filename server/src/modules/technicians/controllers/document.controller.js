import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import pool from '#config/db';
import ApiError from '#shared/utils/apiError';
import ApiResponse from '#shared/utils/apiResponse';
import asyncHandler from '#shared/utils/asyncHandler';
import hashPassword from '#shared/util/password';

import { 
    uploadOnCloudinary,
    deleteFromCloudinary,
} from '#shared/services/storage.service';


import {
    isValidUUID
} from '#shared/utils/validation.util';

import { 
    emailQueue,
    technicianQueue
} from '../jobs/technician.queue.js';

import {
    formatDocument
} from '#shared/utils/technician.util';


const uploadDocument = asyncHandler(async (req, res) => { 
    const technician = req.technician;

    if(!technician){
        throw new ApiError(
            404,
            "Technician account not found"
        );
    }

    let {
        documentId,
        documentName,
        documentType,
        expiryDate
    } = req.body;

    documentId = documentId?.trim() || "";
    documentName = documentName?.trim() || "";
    documentType = documentType?.trim() || "";

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
            documentname,
            documenttype,
            mime_type,
            uploadedDoc.public_id,
            uploadedDoc.secure_url,
            expiry_date || null,
        ];

        let result = await pool.query(query,values);

        if(result.rowCount === 0){
            throw new ApiError(
                500,
                "Failed to upload document"
            )
        }
        
        const uploadedDocument = formatDocument(result.rows[0]);
        
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

    let result = await pool.query(query,[docId, technician.id]);

    if(result.rowCount === 0){
        throw new ApiError(
            400,
            "Document not found"
        );
    }

    try{
        await technicianQueue.add(
            "delete-document",
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
            "delete-document",
            {
                technicianId: technician.id,
                documentId: documentcId
            },
            {
                jobId: `document:deleted:email:${documentcId}`
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

const verifyTechnician = asyncHandler(async (req, res) =>{ });


export {
    uploadDocument,
    updateDocument,
    deleteDocument,
    verifyDocument,
    verifyTechnician
}