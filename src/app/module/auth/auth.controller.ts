import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/AppError";
import { IChangePasswordPayload } from "./auth.interface";
import { CookieUtils } from "../../utils/cookie";

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


const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload: IChangePasswordPayload = req.body;
        const sessionToken = req.cookies['better_auth.session_token'];

        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Session token is missing");
        }

        const result = await authService.changePassword(payload as IChangePasswordPayload, sessionToken);

        const { accessToken, refreshToken, token } = result;
        // Token need to refresh again because after changing password we are revking all other session except the current session, we need to set the new token in cookie after changing password otherwise when we will change the password again then token will show invalid token and you will not able to change the password. 
        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result
        })
    }
)


const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const sessionToken = req.cookies['better_auth.session_token'];
        if (!sessionToken) {
            throw new AppError(status.UNAUTHORIZED, "Session token is missing");
        }
        const result = await authService.logoutUser(sessionToken);

        // clear the cookies
        CookieUtils.clearCookie(res, "accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        CookieUtils.clearCookie(res, "refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        CookieUtils.clearCookie(res, "better_auth.session_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result
        })
    }
)

export const authController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser
}