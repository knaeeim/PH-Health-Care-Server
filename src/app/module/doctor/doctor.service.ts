/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelper/AppError";
import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
                specialties: {
                    include: {
                        specialty: true
                    }
                }
            }
        });
        return doctors;
    } catch (error : any) {
        console.log(error instanceof Error ? error : "Unknown error");
        throw new AppError(status.INTERNAL_SERVER_ERROR, error.message ||"Failed to fetch doctors");
    }
}


export const doctorServices = {
    getAllDoctors
}