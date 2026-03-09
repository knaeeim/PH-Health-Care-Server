import z from "zod";

const bookAppointmentZodSchema = z.object({
    doctorId: z.string("Doctor ID is required"),
    scheduleId: z.string("Schedule ID is required")
})

const changeAppointmentStatusZodSchema = z.object({
    status: z.enum(["CONFIRMED", "CANCELLED"], "Invalid status value")
})


export const appointmentValidation = {
    bookAppointmentZodSchema, 
    changeAppointmentStatusZodSchema
}