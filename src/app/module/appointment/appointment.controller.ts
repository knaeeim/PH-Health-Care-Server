import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { appointmentService } from "./appointment.service";

const bookAppointment = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;
        const result = await appointmentService.bookAppointment(payload, user);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: 'Appointment booked successfully',
            data: result
        })
    }
)

const getMyAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const result = await appointmentService.getMyAppointments(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: result
        })
    }
)


const changeAppointmentStatus = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const appointmentId = req.params.id;
        const payload = req.body;
        const result = await appointmentService.changeAppointmentStatus(appointmentId as string, payload, user)
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Appointment status changed successfully',
            data: result
        })
    }
)


const getMySingleAppointment = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const appointmentId = req.params.id;
        const result = await appointmentService.getMySingleAppointment(appointmentId as string, user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointment retrieved successfully',
            data: result
        })
    }
)


const getAllAppointments = catchAsync(
    async (req: Request, res: Response) => {
        const result = await appointmentService.getAllAppointments();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'All appointments retrieved successfully',
            data: result
        })
    }
)


const bookAppointmentWithPayLater = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;
        const result = await appointmentService.bookAppointmentWithPayLater(payload, user);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: 'Appointment booked successfully with pay later option',
            data: result
        })
    }
)


const initiatePayment = catchAsync(
    async (req: Request, res: Response) => {
        const appointmentId = req.params.id;
        const user = req.user;
        const result = await appointmentService.initiatePayment(appointmentId as string, user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Payment initiated successfully',
            data: result
        })
    }
)


export const appointmentController = {
    bookAppointment,
    getMyAppointments,
    changeAppointmentStatus,
    getMySingleAppointment,
    getAllAppointments,
    bookAppointmentWithPayLater,
    initiatePayment
}