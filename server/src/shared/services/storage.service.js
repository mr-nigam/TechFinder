import cloudinary from '#lib/cloudinaryClient.js';

import {
    ApiError,
    removeLocalFile
} from '#shared';


const uploadOnCloudinary = async (localFilePath) => {

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

const deleteFromCloudinary = async(PublicId, resourceType= "image") => {

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


export {
    uploadOnCloudinary,
    deleteFromCloudinary
};