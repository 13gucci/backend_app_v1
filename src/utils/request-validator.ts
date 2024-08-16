import hc from '@/constants/http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { checkSchema, Schema, ValidationChain, validationResult } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';

// Schema

const validator = (schema: Schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await checkSchema(schema).run(req);
        const result = validationResult(req);

        if (result.isEmpty()) {
            return next();
        }

        return res.status(hc.BAD_REQUEST).json({
            error: result.mapped()
        });
    };
};

export default validator;
