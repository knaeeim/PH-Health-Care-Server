import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { scheduleServices } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { ICreateSchedulePayload } from "./schedule.interface";

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
        const schedules = await scheduleServices.getAllSchedules();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Schedules retrieved successfully",
            data: schedules
        })
    }
)



export const scheduleController = {
    createSchedule,
    getAllSchedules
}