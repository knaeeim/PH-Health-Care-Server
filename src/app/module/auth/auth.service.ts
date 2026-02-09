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
    return data;
}

export const authService = {
    registerPatient,
    loginUser
}