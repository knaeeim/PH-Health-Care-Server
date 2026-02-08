/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { specialtyServices } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";

const createSpecialty = catchAsync(async (req: Request, res: Response) => {
    console.log("Inside Real Controller!!");
    const payload = req.body;
    const specialty = await specialtyServices.createSpecialty(payload);
    res.status(201).json({
        success: true,
        message: "Specialty created successfully",
        data: specialty
    });
})

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const specialties = await specialtyServices.getAllSpecialties();
    res.status(200).json({
        success: true,
        message: "Specialties retrieved successfully",
        data: specialties
    })
})

const deleteSpecialty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedSpecialty = await specialtyServices.deleteSpecialty(id as string);
        res.status(200).json({
            success: true,
            message: "Specialty deleted successfully",
            data: deletedSpecialty
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
            error: error.message
        });
    }
}

const updateSpecialty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const updatedSpecialty = await specialtyServices.updateSpecialty(id as string, payload);
        res.status(200).json({
            success: true,
            message: "Specialty updated successfully",
            data: updatedSpecialty
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
            error: error.message
        });
    }
}


export const specialtyController = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty,
} 