import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parseResult = zodSchema.safeParse(req.body);

        if (!parseResult.success) {
            return next(parseResult.error);
        }

        // sanitized and validated data
        req.body = parseResult.data;
        next();
    }
}