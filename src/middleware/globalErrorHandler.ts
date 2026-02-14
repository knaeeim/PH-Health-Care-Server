/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../app/config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../app/interfaces/error.interfaces";
import z from "zod";
import { handleZodError } from "../app/errorHelper/handleZodError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if (envVars.NODE_ENV === "development") {
        console.error("Error: ", err);
    }

    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message = err.message || "Internal Server Error";
    let stack: string | undefined = undefined;

    const errorSources: TErrorSources[] = [];

    if (err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources.push(...simplifiedError.errorSources!);
    } else if (err instanceof Error) {
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = err.message;
        stack = err.stack;
    }

    const errorResponse: TErrorResponse = {
        success: false,
        message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? err.message : undefined,
    }

    res.status(statusCode).json(errorResponse)
}