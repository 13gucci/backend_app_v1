import hc from '@/constants/http-status-codes';
import { ErrorMessageCode, ErrorUnprocessableEntity } from '@/schemas/errors.schema';
import { NextFunction, Request, Response } from 'express';
import { checkSchema, Location, Schema, validationResult } from 'express-validator';

/**
 * !== 422
 *
 * {
 *      message: string,
 *      error_info?: any
 * }
 *
 * === 422
 *
 * {
 *      message: string,
 *      errors: {
 *          [field: string]: {
 *              msg: string,
 *              location: string,
 *              value: any
 *              ...
 *              }
 *      }
 * }
 */

// Tất cả error được gửi đi, sẽ đều là instanceof ErrorMessageCode

const validator = (schema: Schema, defaultLocations?: Location[] | undefined) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await checkSchema(schema, defaultLocations).run(req);
        const result = validationResult(req);
        const result_errors = result.mapped();

        //If not errors validate then next
        if (result.isEmpty()) {
            return next();
        }

        const unprocessableEntityErros = new ErrorUnprocessableEntity({ errors: {} });

        Object.keys(result_errors).forEach((item) => {
            const { msg } = result_errors[item];

            // If !== 422
            if (msg instanceof ErrorMessageCode && msg.code !== hc.UNPROCESSABLE_ENTITY) {
                return next(msg);
            }

            unprocessableEntityErros.errors[item] = result_errors[item];
        });

        return next(unprocessableEntityErros);
    };
};

export default validator;
