/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";
import { IDoctorUpdatePayload } from "./doctor.interface";
import { Doctor, Prisma, UserStatus } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";

const getAllDoctors = async (query: IQueryParams) => {
    try {
        // const doctors = await prisma.doctor.findMany({
        //     where: {
        //         isDeleted: false
        //     },
        //     include: {
        //         user: true,
        //         specialties: {
        //             include: {
        //                 specialty: true
        //             }
        //         }
        //     }
        // });
        // return doctors;

        const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(prisma.doctor, query,
            {
                searchableFields: doctorSearchableFields,
                filterableFields: doctorFilterableFields
            }
        )

        const result = await queryBuilder
            .search()
            .filter()
            .where({
                isDeleted: false,
            })
            .include({
                user: true,
                specialties: true,
                // specialties : {
                //     include : {
                //         specialty : true
                //     }
                // }
            })
            .dynamicInclude(doctorIncludeConfig)
            .paginate()
            .sort()
            .fields()
            .execute();

        return result;
    } catch (error: any) {
        console.log(error instanceof Error ? error : "Unknown error");
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to fetch doctors");
    }
}

const getDoctorById = async (id: string) => {
    try {
        const doctor = await prisma.doctor.findUnique({
            where: {
                id,
                isDeleted: false
            },
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                },
                appointments: {
                    include: {
                        patient: true,
                        schedule: true,
                        prescription: true
                    }
                },
                doctorSchedules: {
                    include: {
                        schedule: true
                    }
                },
                reviews: true
            }
        })
        return doctor;
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message || "Failed to fetch doctor");
    }
}

const updateDoctor = async (id: string, payload: IDoctorUpdatePayload) => {
    try {
        const doctorExists = await prisma.doctor.findUnique({
            where: {
                id
            }
        })

        if (!doctorExists) {
            throw new AppError(status.NOT_FOUND, "Doctor not found");
        }

        const { doctor: doctorData, specialties } = payload;

        try {
            await prisma.$transaction(async (tx) => {
                if (doctorData) {
                    await tx.doctor.update({
                        where: {
                            id
                        },
                        data: {
                            ...doctorData
                        }
                    })
                }

                if (specialties && specialties.length > 0) {
                    for (const specialty of specialties) {
                        const { specialtyId, shouldDelete } = specialty;
                        if (shouldDelete) {
                            await tx.doctorSpecialty.delete({
                                where: {
                                    doctorId_specialtyId: {
                                        doctorId: id,
                                        specialtyId,
                                    }
                                }
                            })
                        }
                        else {
                            await tx.doctorSpecialty.upsert({
                                where: {
                                    doctorId_specialtyId: {
                                        doctorId: id,
                                        specialtyId,
                                    }
                                },
                                create: {
                                    doctorId: id,
                                    specialtyId,
                                },
                                update: {}
                            })
                        }
                    }

                }
            })
            const doctor = await getDoctorById(id);
            return doctor;
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
            },
            include: {
                user: true
            }
        })

        if (!doctorExists) {
            throw new AppError(status.NOT_FOUND, "Doctor not found");
        }

        if (doctorExists.isDeleted) {
            throw new AppError(status.BAD_REQUEST, "Doctor already deleted");
        }

        await prisma.$transaction(async (tx) => {
            await tx.doctor.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            })

            await tx.user.update({
                where: { id: doctorExists.userId },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    status: UserStatus.DELETED
                }
            })

            await tx.session.deleteMany({
                where: {
                    userId: doctorExists.userId
                }
            })

            await tx.doctorSpecialty.deleteMany({
                where: {
                    doctorId: id
                }
            })

        })
        return { message: "Doctor deleted successfully" };
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