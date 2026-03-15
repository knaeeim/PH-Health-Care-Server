import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePatientProfileZodSchema = z.object({
    patientInfo: z.object({
        name: z.string("Name must be a string").min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
        profilePhoto: z.string("Profile must be a string").optional(),
        contactNumber: z.string("Contact number must be a string").min(12, "Contact Number must be at least 12 characters long").max(12, "Contact Number must be at most 12 characters long").optional(),
        address: z.string("Address must be a string").min(1, "Address is required").max(200, "Address must be less than 200 characters").optional()
    }).optional(),
    patientHealthData: z.object({
        gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
        dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format"
        }).optional(),
        bloodGroup: z.enum([BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE, BloodGroup.AB_POSITIVE, BloodGroup.AB_NEGATIVE]).optional(),
        hasAllergies: z.boolean().optional(),
        hasDiabetes: z.boolean().optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        smokingStatus: z.boolean().optional(),
        dietaryPreferences: z.string().optional(),
        pregnancyStatus: z.boolean().optional(),
        mentalHealthHistory: z.string().optional(),
        immunizationStatus: z.string().optional(),
        hasPastSurgeries: z.boolean().optional(),
        recentAnxiety: z.boolean().optional(),
        recentDepression: z.boolean().optional(),
        maritalStatus: z.string().optional()
    }).optional(),
    medicalReports: z.array(z.object({
        reportName: z.string().min(1, "Name should be at least 1 character").max(100, "Report name must be less than 100 characters").optional(),
        reportLink: z.string().min(1, "Report link should be at least 1 character").max(200, "Report link must be less than 200 characters").optional(),
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional()
    })).optional().refine((reports) => {
        if (!reports || reports.length === 0) return true;

        for (const report of reports) {
            // case-1 
            if (!report.reportId && report.shouldDelete === true) return false;

            // case-2
            if (report.reportId && !report.shouldDelete) return false;

            // case-3 
            if (report.reportName && !report.reportLink) return false;

            // case-4
            if (report.reportLink && !report.reportName) return false;

            return true;
        }
    })
})



export const validateUpdatePatientProfile = {
    updatePatientProfileZodSchema
}