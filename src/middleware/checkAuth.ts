/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { Role, UserStatus } from "../generated/prisma/enums"
import { CookieUtils } from "../app/utils/cookie"
import { prisma } from "../app/lib/prisma"
import AppError from "../app/errorHelper/AppError"
import status from "http-status"
import { JwtUtils } from "../app/utils/jwt"
import { envVars } from "../app/config/env"

export const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            // session token Verification
            const sessionToken = CookieUtils.getCookie(req, "better_auth.session_token");

            if (!sessionToken) {
                throw new Error("Unauthorized: No session token provided");
            }

            if (sessionToken) {
                const sessionExits = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: {
                            gt: new Date()
                        }
                    },
                    include: {
                        user: true
                    }
                })

                if (sessionExits && sessionExits.user) {
                    const user = sessionExits.user;

                    const now = new Date();
                    const expiresAt = new Date(sessionExits.expiresAt);
                    const createAt = new Date(sessionExits.createdAt);

                    const sessionLifeTime = expiresAt.getTime() - createAt.getTime();
                    const timeRemaining = expiresAt.getTime() - now.getTime();
                    const percentageRemaining = (timeRemaining / sessionLifeTime) * 100;

                    if (percentageRemaining < 20) {
                        res.setHeader("X-Session-Refresh", "true");
                        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
                        res.setHeader("X-Time-Remaining", timeRemaining.toString());

                        console.log("Session Expiring Soon!!");
                    }

                    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                        throw new Error("Unauthorized: User is blocked or deleted");
                    }

                    if (user.isDeleted) {
                        throw new Error("Unauthorized: User is deleted");
                    }

                    if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
                        throw new Error("Forbidden: You don't have permission to access this resource");
                    }

                    req.user = {
                        userId: user.id,
                        role: user.role as Role,
                        email: user.email
                    }
                }
            }

            // Access token Verification
            const accessToken = CookieUtils.getCookie(req, "accessToken");

            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized: No access token provided");
            }

            const verifiedToken = JwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

            if (!verifiedToken.success) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized: Invalid access token");
            }

            if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data!.role as Role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden: You don't have permission to access this resource");
            }

            next();
        } catch (error: any) {
            next(error);
        }
    }
}