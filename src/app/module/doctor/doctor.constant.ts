import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = ["name", "email", "qualifications", "designation", "currentWorkingPlace", "registrationNumber", "specialties.specialty.title"];

export const doctorFilterableFields = ["gender", "isDeleted", "appointmentFee", "experience", "designation", "qualifications", "currentWorkingPlace", "registrationNumber", "specialties.specialty.title", "user.role", "specialties.specialtyId"];

export const doctorIncludeConfig: Partial<Record<keyof Prisma.DoctorInclude, Prisma.DoctorInclude[keyof Prisma.DoctorInclude]>> = {
    user: true,
    specialties: {
        include: {
            specialty: true
        }
    },
    doctorSchedules: {
        include: {
            schedule: true
        }
    },
    prescriptions: true,
    reviews: true
}