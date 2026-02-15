import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const data = await authService.registerPatient(payload);

    const { accessToken, refreshToken, token, ...rest } = data;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Patient registered successfully",
        data : {
            accessToken,
            refreshToken,
            token,
            ...rest
        }
    })
})

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const data = await authService.loginUser(payload);

    const { accessToken, refreshToken, token, ...rest } = data;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken,
            refreshToken,
            token,
            ...rest
        }
    })
})


export const authController = {
    registerPatient,
    loginUser
}