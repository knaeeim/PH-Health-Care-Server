/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";
import status from "http-status";
import path from 'path';
import ejs from "ejs";

interface SendEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType: string;
    }[];
}


const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: parseInt(envVars.EMAIL_SENDER.SMTP_PORT),
    secure: true,
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASSWORD
    }
})


export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: SendEmailOptions) => {
    try {
        // We need to build the path for the template based on the templateName
        const templatePath = `${path.resolve(process.cwd(), `src/templates/${templateName}.ejs`)}`;

        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html,
            attachments: attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType
            }))
        })

        console.log(`Email Send to ${to} : ${info.messageId}`);
    } catch (error: any) {
        console.log("Email Sending Error", error);
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email");
    }
}