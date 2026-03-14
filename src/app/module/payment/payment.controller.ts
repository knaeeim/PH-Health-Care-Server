/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(
    async (req: Request, res: Response) => {
        const signature = req.headers['stripe-signature'] as string;
        const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.log("Missing Stripe Signature or Webhook Secret");
            return res.status(status.BAD_REQUEST).json({
                message: "Missing Stripe Signature or Webhook Secret"
            })
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        } catch (error: any) {
            console.log("Error Processing stripe webhooks", error);
            return res.status(status.BAD_REQUEST).json({
                message: "Error processing stripe webhooks"
            })
        }

        try {
            const result = await PaymentService.handleStripeWebHookEvent(event);
            sendResponse(res, {
                httpStatusCode: status.OK,
                success: true,
                message: result.message,
                data: result
            })
        } catch (error: any) {
            console.log("Error Handling Stripe webhooks event :", error);
            sendResponse(res, {
                httpStatusCode: status.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Error handling stripe webhooks event"
            })
        }
    }
)


export const paymentController = {
    handleStripeWebhookEvent
}