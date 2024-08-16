import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import User from '@/schemas/user.schema';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';

export const registerController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await usersService.register({ user: new User({ email, password }) });

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
