import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryConfig } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryConfig,
    params: async (req, file) => {
        // first of all we have to get the original Name of the file 
        const originalFileName = file.originalname.toLocaleLowerCase();
        // then have to extract the extension from the original Name
        const extension = originalFileName.split(".").pop()?.toLocaleLowerCase();
        // We also need the original name without extension
        const originalNameWithoutExt = originalFileName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-") // replace spaces with hyphens
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, "");

        const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + originalNameWithoutExt;

        const folder = extension === "pdf" ? "pdfs" : "images";

        return {
            folder: `ph-health-care/${folder}`,
            public_id: uniqueName,
            resource_type: "auto"
        }
    }
})

export const multerConfig = multer({ storage })