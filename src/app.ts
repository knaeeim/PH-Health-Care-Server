import express, { Application, Request, Response } from "express";
import { indexRouter } from "./app/routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import AppError from "./app/errorHelper/AppError";
import cookieParser from "cookie-parser";

// Enable URL-encoded form data parsing
const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Index routes (where all the module routes are registered)
app.use("/api/v1", indexRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
    throw new AppError(404, "Test error handling"); // This will be caught by the global error handler
    res.send("Hello, TypeScript + Express!");
});

// global Error Handler 
app.use(globalErrorHandler);
app.use(notFound);


export default app;
