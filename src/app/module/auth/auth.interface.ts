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

export interface ISessionInterface {
    session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null | undefined | undefined;
        userAgent?: string | null | undefined | undefined;
    };
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined | undefined;
        role: string;
        status: string;
        needPasswordChange: boolean;
        isDeleted: boolean;
        deletedAt?: Date | null | undefined;
    };
};