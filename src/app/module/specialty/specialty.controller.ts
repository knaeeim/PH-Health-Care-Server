/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { specialtyServices } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const specialty = await specialtyServices.createSpecialty(payload);
    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Specialty created successfully",
        data: specialty
    })
})

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const specialties = await specialtyServices.getAllSpecialties();
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialties retrieved successfully",
        data: specialties
    })
})

const deleteSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedSpecialty = await specialtyServices.deleteSpecialty(id as string);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialty deleted successfully",
        data: deletedSpecialty
    })
})

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedSpecialty = await specialtyServices.updateSpecialty(id as string, payload);
    sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Specialty updated successfully",
        data: updatedSpecialty
    })
})


export const specialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty,
} 