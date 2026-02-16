import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { doctorServices } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllDoctors = catchAsync(
    async (req: Request, res: Response) => {
        const doctors = await doctorServices.getAllDoctors();
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctors retrieved successfully",
            data: doctors
        })
    }
)

const getDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const doctor = await doctorServices.getDoctorById(id as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor retrieved successfully",
            data: doctor
        })
    }
)

const updateDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        const doctor = await doctorServices.updateDoctor(id as string, payload);
        console.log(doctor);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor updated successfully",
            data: doctor
        })
    }
)

const deleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const doctor = await doctorServices.deleteDoctor(id as string);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor deleted successfully",
            data: doctor
        })
    }
)


export const doctorController = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
}