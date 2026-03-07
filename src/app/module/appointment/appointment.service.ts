import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IBookAppointmentPayload } from "./appointment.interface"

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

export const appointmentService = {
    bookAppointment,
    getMyAppointments,
}