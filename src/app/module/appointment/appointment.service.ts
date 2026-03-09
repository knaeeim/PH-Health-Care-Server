import { uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IBookAppointmentPayload } from "./appointment.interface"
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelper/AppError";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

// book appointment with paynow
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
        // first need to create a transaction id 
        const transactionId = String(uuidv7());

        // creating the payment data in database
        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with Dr. ${doctorData.name}`
                        },
                        unit_amount: doctorData.appointmentFee * 120
                    },
                    quantity: 1
                }
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: patientData.id,
            },
            success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
            // cancel_url : `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`
            cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`
        })

        return {
            appointmentData,
            paymentData,
            paymentUrl: session.url
        };
    })

    return {
        appointment: result.appointmentData,
        payment: result.paymentData,
        paymentUrl: result.paymentUrl
    };
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

const getAllAppointments = async () => {
    const appointments = await prisma.appointment.findMany({
        include: {
            doctor: true,
            patient: true,
            schedule: true
        }
    });
    return appointments;
}

const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
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

        const transactionId = String(uuidv7());

        const paymentData = await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        return {
            appointmentData,
            paymentData
        };
    })

    return {
        appointment: result.appointmentData,
        payment: result.paymentData
    }
}

const initiatePayment = async (appointmentId: string, user: IRequestUser) => {

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })


    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
            patientId: patientData.id
        },
        include: {
            doctor: true,
            payment: true
        }
    })

    if (appointmentData.payment?.status === PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, "Payment for this appointment is already completed");
    }

    if (appointmentData.status === AppointmentStatus.CANCELLED) {
        throw new AppError(status.BAD_REQUEST, "You can not make payment for a cancelled appointment");
    }

    if (!appointmentData.payment) {
        throw new AppError(status.BAD_REQUEST, "Payment data not found for this appointment");
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: `Appointment with Dr. ${appointmentData.doctor.name}`
                    },
                    unit_amount: appointmentData.doctor.appointmentFee * 120,
                },
                quantity: 1
            }
        ],
        metadata: {
            appointmentId: appointmentData.id,
            paymentId: appointmentData.payment?.id
        },
        success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
        cancel_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-failed`
    })

    return {
        paymentUrl: session.url
    }
}

const cancelUpaidAppointments = async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unPaidAppointments = await prisma.appointment.findMany({
        where: {
            paymentStatus: PaymentStatus.UNPAID,
            createdAt: {
                lte: thirtyMinutesAgo
            }
        }
    })

    const appointmentToCancel = unPaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tx) => {
        await tx.appointment.updateMany({
            where: {
                id: {
                    in: appointmentToCancel
                }
            },
            data: {
                status: AppointmentStatus.CANCELLED
            }
        })

        await tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentToCancel
                }
            }
        })

        for (const unpaidAppointment of unPaidAppointments) {
            await tx.doctorSchedule.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unpaidAppointment.doctorId,
                        scheduleId: unpaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }
    })
}

export const appointmentService = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getAllAppointments,
    getMySingleAppointment,
    bookAppointmentWithPayLater,
    initiatePayment, 
    cancelUpaidAppointments
}