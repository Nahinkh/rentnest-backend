import cloudinary from "../config/cloudinary";

interface ICloudinaryImageUpload{
    imageUrl: string;
    publicId: string;
}

export const uploadImageToCloudinary =  (buffer: Buffer,folder:string): Promise<ICloudinaryImageUpload> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: folder,
            resource_type: "image"
        }, (error, result) => {
            if (error) {
            return  reject(error);
            }
            if(!result){
                return reject(new Error("No result returned from Cloudinary"));
            }
            resolve({
                imageUrl: result.secure_url,
                publicId: result.public_id
            });
        });

        uploadStream.end(buffer);   

    });
};

export const deleteImageFromCloudinary = async (
  publicId: string,
) => {
  return cloudinary.uploader.destroy(publicId);
};