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

export type VerifyForgotPasswordReqBody = {
    verify_forgot_password_token: string;
};

export type ResetPasswordReqBody = {
    verify_forgot_password_token: string;
    new_password: string;
    confirm_password: string;
};

export type UpdateMeReqBody = {
    name?: string;
    date_of_birth?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    username?: string;
    cover_photo?: string;
};

export type ChangePasswordReqBody = {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
};

export type FollowReqBody = {
    followed_user_id: string;
};

export type GetProfileReqParams = {
    username: string;
};

export type UnfollowReqParams = {
    followed_user_id: string;
};
