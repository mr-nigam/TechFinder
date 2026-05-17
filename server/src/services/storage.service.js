import cloudinary from 
'#lib/cloudinaryClient.js';

import{
    ApiError,
    removeLocalFile
} from '#shared';


const uploadOnCloudinary = async (
    localFilePath
) => {

  if(!localFilePath){
    throw new ApiError(
        400,
        "Local file path is required"
    );
  }

  try{
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    await removeLocalFile(localFilePath);

    return result;
  } catch(err){
    await removeLocalFile(localFilePath);
    throw new ApiError(
        500, 
        err.message || "Upload failed"
    );
  }
};

const deleteFromCloudinary = async(
    PublicId, 
    resourceType= "image"
) => {

    if(!PublicId) {
        throw new ApiError(
            400,
            "Public ID required"
        );
    }

    try{
        return await cloudinary.uploader.destroy(
            PublicId,
            {resource_type: resourceType}
        );
    }catch(err){
        throw new ApiError(
            500,
            err?.message ||"Error while deleting the file"
        );

    }
};

const multipleDeleteFromCloudinary = async(
    files = []
) => {

    if(!files.length) return [];

    const results = await Promise.allSettled(
        files.map((file) =>
            deleteFromCloudinary(
                file.public_id,
                file.resource_type
            )
        )
    );

    results.forEach((result) => {

        if (result.status === "rejected") {
            console.error(
                "Cloudinary delete failed:",
                result.reason
            );
        }
    });

    return results;
};


export {
    uploadOnCloudinary,
    deleteFromCloudinary,
    multipleDeleteFromCloudinary
};