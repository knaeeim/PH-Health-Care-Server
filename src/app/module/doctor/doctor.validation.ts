import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

export const updateDoctorZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long").max(20, "Password must be less than 20 characters long"),

    doctor: z.object({
        name: z.string("Name is required").min(3, "Name must be at least 3 characters long").max(50, "Name must be less than 50 characters long"),

        contactNumber: z.string("Contact number is required").min(10, "Contact number must be at least 10 characters long").max(14, "Contact number must be less than 14 characters long"),

        address: z.string().min(10, "Address must be at least 10 characters long").max(100, "Address must be less than 100 characters long").optional(),

        experience: z.int("Experience must be an integer").nonnegative("Experience must be a non-negative integer"),

        gender: z.enum([Gender.MALE, Gender.FEMALE], "Gender must be either male of female"),

        appointmentFee: z.int("Appointment fee must be an integer").nonnegative("Appointment fee must be a non-negative integer"),

        currentWorkingPlace: z.string().min(3, "Current working place must be at least 3 characters long").max(50, "Current working place must be less than 50 characters long"),

        designation: z.string().min(3, "Designation must be at least 3 characters long").max(50, "Designation must be less than 50 characters long"),

        qualifications: z.string(),
    }),
    specialties: z.array(z.uuid(), "Specialties must be an array of strings").min(1, "At least one specialty is required")
}).partial();