import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

interface IRegisterPatient {
    name: string;
    email: string;
    password: string
}

const registerPatient = async (payload: IRegisterPatient) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            // role : Role.PATIENT
        }
    })

    if (!data.user) {
        throw new Error("Registration failed");
    }

    // TODO : Create Patient Profile Using transaction (create user and profile in a transaction)

    return data;
}

interface ILoginUser {
    email: string;
    password: string;
}

const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })

    if(data.user.status === UserStatus.BLOCKED){
        throw new Error("Your account is blocked. Please contact support.");
    }

    if(data.user.isDeleted === true){
        throw new Error("Your account is deleted. Please contact support.");
    }

    return data;
}

export const authService = {
    registerPatient,
    loginUser
}