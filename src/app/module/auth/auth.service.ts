/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatient {
    name: string;
    email: string;
    password: string
}

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
        throw new Error("Registration failed");
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

        return { ...data, patient };
    } catch (error: any) {
        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })
        throw new Error("Failed to create patient profile", error);
    }
}

interface ILoginUser {
    email: string;
    password: string;
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
        throw new Error("Your account is blocked. Please contact support.");
    }

    if (data.user.isDeleted === true) {
        throw new Error("Your account is deleted. Please contact support.");
    }

    return data;
}

export const authService = {
    registerPatient,
    loginUser
}