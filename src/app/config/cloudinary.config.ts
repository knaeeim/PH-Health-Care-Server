/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelper/AppError";
import status from "http-status";


cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
    api_key: envVars.CLOUDINARY.API_KEY,
    api_secret: envVars.CLOUDINARY.API_SECRET
})

export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse> => {
    if (!buffer || !fileName) {
        throw new AppError(status.BAD_REQUEST, "File buffer and file name are required for upload");
    }
    // then have to extract the extension from the original Name
    const extension = fileName.split(".").pop()?.toLocaleLowerCase();
    // We also need the original name without extension
    const originalNameWithoutExt = fileName
        .split(".")
        .slice(0, -1)
        .join(".")
        .toLowerCase()
        .replace(/\s+/g, "-") // replace spaces with hyphens
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");

    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + originalNameWithoutExt;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: `ph-health-care/${folder}/${uniqueName}`,
                folder: `ph-health-care/${folder}`
            },
            (error, result) => {
                if (error) {
                    return reject(new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary"));
                }
                resolve(result as UploadApiResponse);
            }
        ).end(buffer);
    })

}

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
