import { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler = <P>(asyncFunc: RequestHandler<P>) => {
    return async (req: Request<P>, res: Response, next: NextFunction) => {
        try {
            await asyncFunc(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};
