import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '@/@types/request.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import User from '@/schemas/user.schema';
import refreshTokenService from '@/services/refresh-token.service';
import usersService from '@/services/users.service';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

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
    const { _id } = user as User;

    const response = await usersService.login({ user_id: _id.toString() });

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
