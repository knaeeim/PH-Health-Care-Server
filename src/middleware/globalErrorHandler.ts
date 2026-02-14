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

    const errorSources : TErrorSources[] = [];

    if(err instanceof z.ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources.push(...simplifiedError.errorSources!);
    }

    const errorResponse : TErrorResponse = {
        success : false,
        message,
        errorSources,
        error: envVars.NODE_ENV === "development" ? err.message : undefined,
    }


    res.status(statusCode).json(errorResponse)

}