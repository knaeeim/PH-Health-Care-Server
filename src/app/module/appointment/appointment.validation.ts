import z from "zod";

const bookAppointmentZodSchema = z.object({
    doctorId: z.string("Doctor ID is required"),
    scheduleId: z.string("Schedule ID is required")
})


export const appointmentValidation = {
    bookAppointmentZodSchema
}