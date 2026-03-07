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
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
        })
    }
)


const changeAppointmentStatus = catchAsync(
    async (req: Request, res: Response) => {
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
        })
    }
)


const getMySingleAppointment = catchAsync(
    async (req: Request, res: Response) => {
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
        })
    }
)


const getAllAppointments = catchAsync(
    async (req: Request, res: Response) => {
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
        })
    }
)


const bookAppointmentWithPayLater = catchAsync(
    async (req: Request, res: Response) => {
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
        })
    }
)


const initiatePayment = catchAsync(
    async (req: Request, res: Response) => {
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'My appointments retrieved successfully',
            data: null
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