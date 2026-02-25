/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../app/config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../app/interfaces/error.interfaces";
import z from "zod";
import { handleZodError } from "../app/errorHelper/handleZodError";
import AppError from "../app/errorHelper/AppError";
import { deleteFromCloudinary } from "../app/config/cloudinary.config";

export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.error("Error: ", err);
    }

    // If user uploads any file then delete that file from cloudinary if any error occurs
    if (req.file) {
        await deleteFromCloudinary(req.file.path);
    }

    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal Server Error";
    let stack: string | undefined = undefined;

    let errorSources: TErrorSources[] = [];

    if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources.push(...simplifiedError.errorSources!);
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ]
    }
    else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: "",
                message: err.message
            }
        ]
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorResponse)
}