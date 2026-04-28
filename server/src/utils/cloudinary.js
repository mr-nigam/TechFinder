import fs from 'fs';
import ApiError from './apiError.js';
import {v2 as cloudinary} from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const removeLocalFile = async (filePath) => {
  try {
    if (filePath) await fs.promises.unlink(filePath);
  } catch {}
};

const uploadOnCloudinary = async(localFilePath) => {
    if(!localFilePath){
        throw new ApiError(400,"local file path is required");
    }

    try{
        const stats = await fs.promises.stat(path);
        if(stats.size > 5 * 1024 * 1024)

        const result = await cloudinary.uploader.upload(
            localFilePath,
            {resource_type: "auto"}
        );
        
        await removeLocalFile(localFilePath);

        return result;

    }catch(err) {
        try{
            await removeLocalFile(localFilePath);
        }catch{}

        throw new ApiError(
            500,
            err.message || "Cloudinary file upload failed"
        );
    }
};

const deleteFromCloudinary = async(PublicId, resourceType= "image") => {
    if(!PublicId) {
        throw new ApiError(400, "Public ID required");
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
    deleteFromCloudinary,
    removeLocalFile
};