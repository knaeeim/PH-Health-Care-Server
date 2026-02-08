import express, { Application, Request, Response } from "express";
import { indexRouter } from "./app/routes";

// Enable URL-encoded form data parsing
const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Index routes (where all the module routes are registered)
app.use("/api/v1", indexRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript + Express!");
});

export default app;
