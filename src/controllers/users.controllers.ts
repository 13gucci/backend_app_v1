import User from '@/models/schemas/user.schema';
import usersService from '@/services/users.service';
import { Request, Response } from 'express';

export const registerController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await usersService.register({ user: new User({ email, password }) });

        return res.status(200).json({
            message: 'Login success',
            user
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Login failed',
            error
        });
    }
};
