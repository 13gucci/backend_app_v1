import hc from '@/constants/http-status-codes';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';

//getOwnPropertyDescriptor: lấy ra thuộc tính của object key | hiển thị hoặc không

// Error is error have status code
export const appErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ErrorMessageCode) {
        return res.status(err.code).json(omit(err, ['code']));
    }

    Object.getOwnPropertyNames(err).forEach((key) => {
        Object.defineProperty(err, key, {
            enumerable: true
        });
    });

    return res.status(hc.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        errorInfor: omit(err, [''])
    });
};
