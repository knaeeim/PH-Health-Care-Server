import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const data = await authService.registerPatient(payload);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Patient registered successfully",
        data
    })
})

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const data = await authService.loginUser(payload);

    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "User logged in successfully",
        data
    })
})


export const authController = {
    registerPatient,
    loginUser
}