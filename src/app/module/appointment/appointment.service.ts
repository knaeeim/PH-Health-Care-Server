import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IBookAppointmentPayload } from "./appointment.interface"
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import status from "http-status";

const bookAppointment = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const scheduleData = await prisma.schedule.findUniqueOrThrow({
        where: {
            id: payload.scheduleId
        }
    })

    const doctorScheduleData = await prisma.doctorSchedule.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleData.id
            }
        }
    })

    const videoCalligId = String(uuidv7());

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                doctorId: payload.doctorId,
                patientId: patientData.id,
                scheduleId: doctorScheduleData.scheduleId,
                videoCallingId: videoCalligId
            }
        })

        await tx.doctorSchedule.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: payload.doctorId,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })

        // TODO: Payment integration will be here
        return appointmentData;
    })

    return result;
}

const getMyAppointments = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        }
    })

    let appointments = [];

    if (patientData) {
        appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        })
    }
    else if (doctorData) {
        appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        })
    }
    else throw new Error("User not found");
    return appointments;
}

const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            // status: AppointmentStatus.SCHEDULED
        },
        include: {
            doctor: true
        }
    })

    if (user?.role === Role.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email)) {
            throw new AppError(status.BAD_REQUEST, "You are not authorized to change the status of this appointment");
        }
    }

    if (user.role === Role.PATIENT) {
        if (appointmentData.status !== AppointmentStatus.SCHEDULED) {
            throw new AppError(status.BAD_REQUEST, "You can only cancel a scheduled appointment");
        }
        else if (appointmentData.status === AppointmentStatus.SCHEDULED) {
            await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: AppointmentStatus.CANCELLED
                }
            })
        }
        else {
            throw new AppError(status.BAD_REQUEST, "You can not change the status of this appointment");
        }
    }
    else {
        if (appointmentData.status === AppointmentStatus.SCHEDULED || appointmentData.status === AppointmentStatus.INPROGRESS) {
            await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: appointmentStatus
                }
            })
        }
    }

}

const getMySingleAppointment = async (appointmentId: string, user: IRequestUser) => {
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUnique({
        where: {
            email: user.email
        }
    })

    let appointment;

    if (patientData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientId: patientData.id
            },
            include: {
                doctor: true,
                schedule: true
            }
        });
    }
    else if (doctorData) {
        appointment = await prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                schedule: true
            }
        });
    }

    if (!appointment) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }
    return appointment;
}

export const appointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
}