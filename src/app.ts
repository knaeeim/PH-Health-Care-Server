import express, { Application, Request, Response } from "express";
import { indexRouter } from "./app/routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";

// Enable URL-encoded form data parsing
const app: Application = express();

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// Set up EJS as the view engine because amara google login er callback ejs template use kore korbo
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/templates"));

app.use("/api/auth/", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Index routes (where all the module routes are registered)
app.use("/api/v1", indexRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript + Express!");
});

// global Error Handler 
app.use(globalErrorHandler);
app.use(notFound);


export default app;
