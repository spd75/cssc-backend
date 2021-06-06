/* Errors */
export const InvalidTokenError = new Error('Invalid token provided.');
InvalidTokenError.name = 'InvalidTokenError';

export const PromiseSeriesFailed = new Error('A series of promises failed.');
PromiseSeriesFailed.name = 'PromiseSeriesFailed';

export const UserAuthenticationFailed = new Error('User authentication failed.');
UserAuthenticationFailed.name = 'UserAuthenticationFailed';

export const UserNotFound = new Error('User not found.');
UserNotFound.name = 'UserNotFound';

/* Helper types */
export type AuthUserInfo = {
    premail: string;
    gradeLevel: string;
};

export type CreateUserBody = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gradeLevel: string;
};

export type FindUserbody = {
    premail: string;
};

export type LoginBody = {
    premail: string;
    password: string;
};

export type UpdateTokenBody = {
    premail: string;
    refreshToken: string;
};

export type UpdateUserBody = {
    premail: string;
    firstName?: string;
    lastName?: string;
    gradeLevel?: string;
    paidDues?: boolean;
};

export type User = {
    firstName: string;
    lastName: string;
    premail: string;
    email: string;
    password: string;
    gradeLevel: string;
    paidDues: boolean;
    refreshToken: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export enum TokenType {
    Auth,
    Refresh
}
