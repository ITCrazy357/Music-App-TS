import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const streamUpload = (
  buffer: Buffer,
  resourceType: "auto" | "image" | "video" | "raw" = "auto",
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadToCloudinary = async (
  buffer: Buffer,
  resourceType: "auto" | "image" | "video" | "raw" = "auto",
): Promise<string> => {
  let result = await streamUpload(buffer, resourceType);
  return result.secure_url;
};
