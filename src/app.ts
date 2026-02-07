import express, { Application, Request, Response } from "express";

// Enable URL-encoded form data parsing
const app: Application = express();

app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript + Express!");
});

export default app;
