import { RegisterReqBody } from '@/@types/register.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import User from '@/schemas/user.schema';
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

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { _id } = user as User;

    const response = await usersService.login({ user_id: _id.toString() });

    return res.status(hc.OK).json({
        message: authMsg.SUCCESS.LOGIN,
        data: response
    });
};
