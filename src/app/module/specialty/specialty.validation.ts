import z from "zod";

const createSpecialtyZodSchema = z.object({
    title: z.string("Title is required").min(1, "Title cannot be empty"),
    description: z.string().optional(),
})

export const specialtyValidation = {
    createSpecialtyZodSchema,
}