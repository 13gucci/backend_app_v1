export type RegisterReqBody = {
    email: string;
    password: string;
    date_of_birth: string;
    confirm_password: string;
    name: string;
};

export type LoginReqBody = {
    email: string;
    password: string;
};

export type LogoutReqBody = {
    refresh_token: string;
};

export type ForgotPasswordReqBody = {
    email: string;
};
