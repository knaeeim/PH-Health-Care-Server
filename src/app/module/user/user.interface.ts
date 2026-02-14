import { Gender } from "../../../generated/prisma/enums";


export interface ICreateDoctorPayLoad {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        registrationNumber: string;
        experience?: number;
        gender: Gender;
        appointmentFee: number;
        qualifications: string;
        currentWorkingPlace: string;
        designation: string;
    },
    specialties: string[];
}