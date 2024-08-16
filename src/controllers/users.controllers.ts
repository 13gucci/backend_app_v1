import { RegisterReqBody } from '@/@types/register.type';
import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import User from '@/schemas/user.schema';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

export const registerController = async (req: Request<ParamsDictionary, unknown, RegisterReqBody>, res: Response) => {
    const { date_of_birth, email, name, password } = req.body;
    try {
        const user = await usersService.register({ user: { date_of_birth, email, name, password } });

        return res.status(hc.CREATED).json({
            message: authMsg.SUCCESS.REGISTER,
            user
        });
    } catch (error) {
        return res.status(hc.BAD_REQUEST).json({
            message: authMsg.FAILURE.REGISTER,
            error
        });
    }
};
