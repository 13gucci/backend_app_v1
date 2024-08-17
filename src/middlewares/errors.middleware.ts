import hc from '@/constants/http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

// Error is error have status code
export const appErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('Index error: ', err);

    res.status(err.code || hc.INTERNAL_SERVER_ERROR).json(omit(err, ['code']));
};
