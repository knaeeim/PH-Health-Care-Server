/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelper/AppError";
import status from "http-status";


cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
    api_key: envVars.CLOUDINARY.API_KEY,
    api_secret: envVars.CLOUDINARY.API_SECRET
})


export const deleteFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
        const match = url.match(regex);
        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image"
            })
            console.log(`File with ${publicId} has been deleted from Cloudinary`);
        }
    } catch (error: any) {
        console.log(error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete image from Cloudinary");
    }

}

export const cloudinaryConfig = cloudinary;
