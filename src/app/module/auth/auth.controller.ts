import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";

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
        data: {
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

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const userData = await authService.getMe(user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User data fetched successfully",
            data: userData
        })

    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies['better_auth.session_token'];
        
        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh Token is missing");
        }

        const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken: newSessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, newSessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New access token generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken: newSessionToken
            }
        })

    }
)


export const authController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken
}