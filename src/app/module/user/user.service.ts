/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPayLoad } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayLoad) => {
    const specialties: Specialty[] = [];

    for (const specialtyId of payload.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: {
                id: specialtyId
            }
        })

        if (!specialty) {
            throw new AppError(status.BAD_REQUEST, `Specialty with id ${specialtyId} not found`);
        }

        specialties.push(specialty);
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }
    })

    if (userExists) {
        throw new AppError(status.CONFLICT, "Doctor already exists");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.doctor.email,
            password: payload.password,
            name: payload.doctor.name,
            role: Role.DOCTOR,
            needPasswordChange: true
        }
    })

    try {
        const result = await prisma.$transaction(async (tx) => {
            const doctorData = await tx.doctor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.doctor,
                }
            })

            const specialtiesData = specialties.map(specialty => {
                return {
                    doctorId: doctorData.id,
                    specialtyId: specialty.id
                }
            })

            await tx.doctorSpecialty.createMany({
                data: specialtiesData
            })

            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorData.id
                },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualifications: true,
                    currentWorkingPlace: true,
                    designation: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    specialties: {
                        select: {
                            specialty: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }

            })
            return doctor;
        })
        return result;
    } catch (error) {
        console.log("Transaction Error ", error);
        if (userData?.user?.id) {
            await prisma.user.delete({
                where: {
                    id: userData.user.id
                }
            }).catch(err => console.log("Critical : Failed to cleanup User!", err));
        }
        throw new AppError(status.INTERNAL_SERVER_ERROR, error instanceof Error ? error.message : "Failed to create doctor");
    }
}


const createAdmin = async (payload: ICreateAdminPayload) => {
    try {
        const { password, admin } = payload;

        const userExists = await prisma.user.findUnique({
            where: {
                id: admin.email
            }
        })

        if (userExists) {
            throw new AppError(status.CONFLICT, "Admin already exists");
        }

        const user = await auth.api.signUpEmail({
            body: {
                email: admin.email,
                password: password,
                name: admin.name,
                role: Role.ADMIN,
                needPasswordChange: true
            }
        })

        return user.user;

    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to create admin");
    }
}


export const userService = {
    createDoctor,
    createAdmin
}