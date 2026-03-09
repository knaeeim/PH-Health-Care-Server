/* eslint-disable @typescript-eslint/no-explicit-any */
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
import qs from "qs";
import { paymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { appointmentService } from "./app/module/appointment/appointment.service";

// Enable URL-encoded form data parsing
const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.post("/webhook", express.raw({ type: "application/json" }), paymentController.handleStripeWebhookEvent);

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

cron.schedule("*/25 * * * *", async () => {
    try {
        console.log("cron jobs is running");
        await appointmentService.cancelUpaidAppointments();
    } catch (error: any) {
        console.log(`Error is ${error}`);
    }
})

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
