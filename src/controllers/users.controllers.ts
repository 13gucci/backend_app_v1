import { RegisterReqBody } from '@/@types/register.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export const registerController = async (req: Request<ParamsDictionary, unknown, RegisterReqBody>, res: Response) => {
    const { confirm_password, ...rest } = req.body;

    const response = await usersService.createUser({ user: rest });

    return res.status(hc.CREATED).json({
        message: authMsg.SUCCESS.REGISTER,
        data: response
    });
};
