import { APIError } from "better-auth"
import status from "http-status"
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums"
import { auth } from "../lib/auth"

/* eslint-disable @typescript-eslint/no-explicit-any */
const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExists = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        })

        if (isSuperAdminExists) {
            console.log("Super Admin already Exists, Skipping Seeding");
        }

        const superAdmin = await auth.api.signUpEmail({
            body: {
                email: "",
                password: "",
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false
            }
        })
    } catch (error: any) {
        throw new APIError(status.INTERNAL_SERVER_ERROR, error)
    }
}