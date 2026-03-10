import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums"
import { auth } from "../lib/auth"
import { envVars } from "../config/env"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const seedSuperAdmin = async () => {
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
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: superAdmin.user.id
                },
                data: {
                    emailVerified: true,
                }
            })
            await tx.admin.create({
                data: {
                    userId: superAdmin.user.id,
                    name: "Super Admin",
                    email: envVars.SUPER_ADMIN_EMAIL,
                }
            })
        })

        const superAdminData = await prisma.user.findUnique({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL
            }
        })

        console.log("Super Admin Seeded Successfully", superAdminData);

    } catch (error: any) {
        console.log("Super Admin Creation Failed", error);
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL
            }
        })
    }
}