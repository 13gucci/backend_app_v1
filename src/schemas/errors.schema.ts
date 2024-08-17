// 2 types of Error

import hc from '@/constants/http-status-codes';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ValidationError } from 'express-validator';

/**
 * !== 4xx
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
 *              }
 *      }
 * }
 */

export class ErrorMessageCode {
    message: string;
    code: number;

    constructor({ message, code }: { message: string; code: number }) {
        this.message = message;
        this.code = code;
    }
}
export class ErrorUnprocessableEntity extends ErrorMessageCode {
    errors: Record<string, ValidationError>;

    constructor({
        message = validationMsg.VALIDATION_ERROR,
        code = hc.UNPROCESSABLE_ENTITY,
        errors
    }: {
        message?: string;
        code?: number;
        errors: Record<string, ValidationError>;
    }) {
        super({ message, code });
        this.errors = errors;
    }
}
