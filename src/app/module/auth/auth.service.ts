/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { JwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, ILoginUser, IRegisterPatient } from "./auth.interface";

const registerPatient = async (payload: IRegisterPatient) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            // role : Role.PATIENT
        }
    })

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Registration failed");
    }

    // TODO : Create Patient Profile Using transaction (create user and profile in a transaction)
    try {
        const patient = await prisma.$transaction(async (tx) => {
            return await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email,
                }
            })
        })
        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.name,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.name,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        })

        return { ...data, patient, accessToken, refreshToken };
    } catch (error: any) {
        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Registration failed");
    }
}

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "Your account is blocked. Please contact support.");
    }

    if (data.user.isDeleted === true || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "Your account is deleted. Please contact support.");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    })

    return { ...data, accessToken, refreshToken };
}


const getMe = async (user: IRequestUser) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: user.userId
        },
        include: {
            patient: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true
                }
            },
            doctor: {
                include: {
                    specialties: true,
                    appointments: true,
                    reviews: true,
                    prescriptions: true
                }
            },
            admin: true
        }
    })

    if (!userData) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return userData;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {

    const isSessionValid = await prisma.session.findUnique({
        where: {
            token: sessionToken
        },
        include: {
            user: true
        }
    })

    if (!isSessionValid) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifidRefreshToken = JwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);

    if (!verifidRefreshToken.success && verifidRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifidRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: data.name,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified
    })

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.id,
        email: data.email,
        role: data.role,
        name: data.name,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified
    })

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date()
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token
    }
}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    try {
        const session = await auth.api.getSession({
            headers: new Headers({
                Authorization: `Bearer ${sessionToken}`
            })
        })

        if (!session) {
            throw new AppError(status.UNAUTHORIZED, "Invalid session token");
        }

        const { currentPassword, newPassword } = payload;

        const result = await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                // revoke other session will ensure that all other sessions will be logged out except the current session
                revokeOtherSessions: true
            },
            headers: new Headers({
                Authorization: `Bearer ${sessionToken}`
            })
        })

        const accessToken = tokenUtils.getAccessToken({
            userId: session.user.id,
            email: session.user.email,
            role: session.user.role,
            name: session.user.name,
            status: session.user.status,
            isDeleted: session.user.isDeleted,
            emailVerified: session.user.emailVerified
        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: session.user.id,
            email: session.user.email,
            role: session.user.role,
            name: session.user.name,
            status: session.user.status,
            isDeleted: session.user.isDeleted,
            emailVerified: session.user.emailVerified
        })

        return {
            accessToken,
            refreshToken,
            ...result
        };

    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to change password");
    }
}

const logoutUser = async (sessionToken: string) => {
    try {
        const result = await auth.api.signOut({
            headers: new Headers({
                Authorization: `Bearer ${sessionToken}`
            })
        })

        return result;
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to logout");
    }
}

export const authService = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser
}