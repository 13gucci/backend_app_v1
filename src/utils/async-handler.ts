import { NextFunction, Request, Response } from 'express';

type tAsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any> | any;

export const asyncHandler = (asyncFunc: tAsyncFunction) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await asyncFunc(req, res, next).catch(next);
    };
};
