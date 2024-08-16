import { NextFunction, Request, Response } from 'express';

export const asyncHandler = (asyncFunc: Function) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await asyncFunc(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
