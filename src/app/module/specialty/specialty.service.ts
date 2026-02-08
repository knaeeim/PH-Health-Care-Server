/* eslint-disable @typescript-eslint/no-explicit-any */
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload
    })
    return specialty;
}

const getAllSpecialties = async (): Promise<Specialty[]> => {
    try {
        const specialties = await prisma.specialty.findMany({
            where: {
                isDeleted: false
            }
        })
        return specialties;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

const deleteSpecialty = async (id: string) => {
    try {
        const deletedSpecialty = await prisma.specialty.delete({
            where: {
                id
            },
        })
        return deletedSpecialty;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

const updateSpecialty = async (id: string, payload: Partial<Specialty>) => {
    try {
        const updateSpecialty = await prisma.specialty.update({
            where: {
                id
            },
            data: payload
        })
        return updateSpecialty;
    } catch (error: any) {
        throw new Error(error.message);
    }
}


export const specialtyServices = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    updateSpecialty
} 