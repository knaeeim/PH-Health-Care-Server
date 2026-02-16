/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { IDoctorUpdatePayload } from "./doctor.interface";
import { Specialty } from "../../../generated/prisma/client";

const getAllDoctors = async () => {
    try {
        const doctors = await prisma.doctor.findMany({
            where: {
                isDeleted: false
            },
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            }
        });
        return doctors;
    } catch (error: any) {
        console.log(error instanceof Error ? error : "Unknown error");
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to fetch doctors");
    }
}

const getDoctorById = async (id: string) => {
    try {
        const doctor = await prisma.doctor.findUnique({
            where: {
                id
            },
            include: {
                user: true
            }
        })
        return doctor;
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to fetch doctor");
    }
}

const updateDoctor = async (id: string, payload: IDoctorUpdatePayload) => {
    try {
        const specialties: Specialty[] = [];

        if (payload.specialties && payload.specialties.length > 0) {
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
        }

        const doctorExists = await prisma.doctor.findUnique({
            where: {
                id
            }
        })

        if (!doctorExists) {
            throw new AppError(status.NOT_FOUND, "Doctor not found");
        }

        try {
            return await prisma.$transaction(async (tx) => {
                if (payload.specialties && payload.specialties.length > 0) {
                    const specialtiesData = specialties.map(specialty => {
                        return {
                            doctorId: id,
                            specialtyId: specialty.id
                        }
                    })
                    await tx.doctorSpecialty.deleteMany({
                        where: {
                            doctorId: id
                        }
                    })
                    await tx.doctorSpecialty.createMany({
                        data: specialtiesData
                    })
                }

                const doctorData = await tx.doctor.update({
                    where: {
                        id
                    },
                    data: {
                        ...payload.doctor
                    },
                    include: {
                        user: true,
                        specialties: {
                            select: {
                                specialty: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                })

                // console.log("doctor Data from try", doctorData);
                return {
                    ...doctorData
                }
            })
        } catch (error: any) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to update doctors data");
        }

    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to update doctor");
    }
}

const deleteDoctor = async (id: string) => {
    try {
        const doctorExists = await prisma.doctor.findUnique({
            where: {
                id
            }
        })
        if (!doctorExists) {
            throw new AppError(status.NOT_FOUND, "Doctor not found");
        }
        if (doctorExists.isDeleted) {
            throw new AppError(status.BAD_REQUEST, "Doctor already deleted");
        }
        const deletedDoctor = await prisma.doctor.update({
            where: {
                id
            },
            data: {
                isDeleted: true,
                user: {
                    update: {
                        isDeleted: true
                    }
                }
            }
        })
        return deletedDoctor;
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to delete doctor");
    }
}


export const doctorServices = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
}