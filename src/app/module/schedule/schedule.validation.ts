import z from "zod";

const createScheduleZodSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Please provide a valid date string."
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Please provide a valid date string."
    }),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Please provide a valid time string in HH:MM format."
    }),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Please provide a valid time string in HH:MM format."
    })
})

const updateScheduleZodSchema = z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Please provide a valid date string."
    }).optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Please provide a valid date string."
    }).optional(),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Please provide a valid time string in HH:MM format."
    }).optional(),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format. Please provide a valid time string in HH:MM format."
    }).optional()
})

export const scheduleValidation = {
    createScheduleZodSchema,
    updateScheduleZodSchema
}