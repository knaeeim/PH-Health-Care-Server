import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { userService } from "./user.service";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const data = await userService.createDoctor(payload);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Doctor registered successfully",
        data
    })
})


export const userController = {
    createDoctor
}