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
    } catch (error) {
        console.log(error instanceof Error ? error : "Unknown error");
        throw new Error("Failed to fetch doctors");
    }
}


export const doctorServices = {
    getAllDoctors
}