import {
    ChangePasswordReqBody,
    FollowReqBody,
    ForgotPasswordReqBody,
    GetProfileReqParams,
    LoginReqBody,
    LogoutReqBody,
    RegisterReqBody,
    ResetPasswordReqBody,
    UnfollowReqParams,
    UpdateMeReqBody,
    VerifyForgotPasswordReqBody
} from '@/@types/request.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import User from '@/schemas/user.schema';
import followerService from '@/services/follower.service';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';

export const registerController = async (req: Request<ParamsDictionary, unknown, RegisterReqBody>, res: Response) => {
    const { confirm_password, ...rest } = req.body;

    const response = await usersService.register({ user: rest });

    return res.status(hc.CREATED).json({
        message: authMsg.SUCCESS.REGISTER,
        data: response
    });
};

export const loginController = async (req: Request<ParamsDictionary, unknown, LoginReqBody>, res: Response) => {
    const { user } = req;
    const { _id, verify } = user as User;

    const response = await usersService.login({ user_id: _id.toString(), verify: verify });

    return res.status(hc.OK).json({
        message: authMsg.SUCCESS.LOGIN,
        data: response
    });
};

export const logoutController = async (req: Request<ParamsDictionary, unknown, LogoutReqBody>, res: Response) => {
    const { refresh_token } = req.body;

    const [_, token] = refresh_token.split(' ');

    const response = await usersService.logout({ token: token });

    return res.json(response);
};

export const emailVerifyController = async (req: Request, res: Response) => {
    const { payload_email_verify_decoded } = req;
    const { sub } = payload_email_verify_decoded as JwtPayload;

    const user = await usersService.readUser({ _id: sub as string });

    if (!user) {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: validationMsg.USER_NOTFOUND
        });
    }

    if (user.email_verify_token === '') {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: 'Email user already verified'
        });
    }

    const response = await usersService.verifyEmail({ user_id: user._id.toString() });

    return res.status(hc.OK).json(response);
};

export const resendEmailVerifyController = async (req: Request, res: Response) => {
    const { payload_access_token_decoded } = req;
    const { sub } = payload_access_token_decoded as JwtPayload;

    const user = await usersService.readUser({ _id: sub as string });

    if (!user) {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: validationMsg.USER_NOTFOUND
        });
    }

    if (user.email_verify_token === '') {
        throw new ErrorMessageCode({
            code: hc.BAD_REQUEST,
            message: 'Email user already verified'
        });
    }

    const response = await usersService.resendVerifyEmailToken({ user_id: user._id.toString() });

    return res.status(hc.OK).json(response);
};

export const forgotPasswordController = async (
    req: Request<ParamsDictionary, unknown, ForgotPasswordReqBody>,
    res: Response
) => {
    const { _id, verify } = req.user as User;
    const response = await usersService.updateForgotPasswordToken({ user_id: _id.toString(), verify: verify });

    return res.status(hc.OK).json(response);
};

export const verifyForgotPasswordTokenController = (
    req: Request<ParamsDictionary, unknown, VerifyForgotPasswordReqBody>,
    res: Response
) => {
    return res.status(hc.OK).json({
        message: 'Verify forgot password token success'
    });
};

export const resetPasswordController = async (
    req: Request<ParamsDictionary, unknown, ResetPasswordReqBody>,
    res: Response
) => {
    const { payload_forgot_password_token_decoded } = req as JwtPayload;
    const { new_password } = req.body;
    const { sub } = payload_forgot_password_token_decoded;

    const response = await usersService.resetPassword({ new_password, user_id: sub as string });

    return res.status(hc.OK).json(response);
};

export const getMeController = async (req: Request, res: Response) => {
    const { sub } = req.payload_access_token_decoded as JwtPayload;

    const user = await usersService.readUser({
        _id: sub as string,
        protect_fields: ['password', 'email_verify_token', 'forgot_password_token']
    });

    return res.status(hc.OK).json({
        message: 'Get profile user successfully',
        data: user
    });
};

export const updateMeController = async (req: Request<ParamsDictionary, unknown, UpdateMeReqBody>, res: Response) => {
    const { sub } = req.payload_access_token_decoded as JwtPayload;
    const body = req.body;

    const response = await usersService.updateMe({ user_id: sub as string, body });

    return res.status(hc.OK).json({
        message: 'Update profile successfully',
        data: response
    });
};

export const getUserController = async (req: Request<GetProfileReqParams>, res: Response) => {
    const { username } = req.params;

    const response = await usersService.readUserByUsername({
        username: username,
        protect_fields: ['email_verify_token', 'forgot_password_token', 'password', 'verify']
    });

    if (!response) {
        throw new ErrorMessageCode({
            code: hc.NOT_FOUND,
            message: validationMsg.USER_NOTFOUND
        });
    }

    return res.status(hc.OK).json({
        message: 'Get profile user successfully',
        data: response
    });
};

export const followController = async (req: Request<ParamsDictionary, unknown, FollowReqBody>, res: Response) => {
    const { sub } = req.payload_access_token_decoded as JwtPayload;
    const { followed_user_id } = req.body;

    const isFollowBefore = await followerService.isFollowBefore({
        user_id: sub as string,
        followed_user_id: followed_user_id
    });

    if (isFollowBefore) {
        throw new ErrorMessageCode({
            code: hc.OK,
            message: 'This user was followed'
        });
    }

    const response = await followerService.follow({ user_id: sub as string, followed_user_id: followed_user_id });

    return res.status(hc.OK).json({
        message: 'Follow user successfully'
    });
};

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
    const { sub } = req.payload_access_token_decoded as JwtPayload;
    const { followed_user_id } = req.params;

    const isFollowBefore = await followerService.isFollowBefore({
        user_id: sub as string,
        followed_user_id: followed_user_id
    });

    if (!isFollowBefore) {
        throw new ErrorMessageCode({
            code: hc.OK,
            message: 'Unfollowed already'
        });
    }

    const response = await followerService.unfollow({ user_id: sub as string, followed_user_id: followed_user_id });

    return res.status(hc.OK).json(response);
};

export const changePasswordController = async (
    req: Request<ParamsDictionary, unknown, ChangePasswordReqBody>,
    res: Response
) => {
    const { new_password } = req.body;
    const { sub } = req.payload_access_token_decoded as JwtPayload;

    const response = await usersService.changePassword({ password: new_password, user_id: sub as string });

    return res.status(hc.OK).json(response);
};
