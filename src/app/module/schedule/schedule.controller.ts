import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { scheduleServices } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { ICreateSchedulePayload } from "./schedule.interface";
import { IQueryParams } from "../../interfaces/query.interface";

const createSchedule = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const schedule = await scheduleServices.createSchedule(payload as ICreateSchedulePayload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Schedule created successfully",
            data: schedule
        })
    }
)

const getAllSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;
        const schedules = await scheduleServices.getAllSchedules(query as IQueryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Schedules retrieved successfully",
            data: schedules
        })
    }
)

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const schedule = await scheduleServices.getScheduleById(id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule retrieved successfully',
        data: schedule
    });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedSchedule = await scheduleServices.updateSchedule(id as string, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule updated successfully',
        data: updatedSchedule
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await scheduleServices.deleteSchedule(id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule deleted successfully',
    });
}
);



export const scheduleController = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}