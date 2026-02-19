export interface IRegisterPatient {
    name: string;
    email: string;
    password: string
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}