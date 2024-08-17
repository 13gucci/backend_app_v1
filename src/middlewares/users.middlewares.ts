import hc from '@/constants/http-status-codes';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import usersService from '@/services/users.service';
import validator from '@/utils/request-validator';
import { checkSchema, Schema } from 'express-validator';

//Register Middlewares

const registerValidatorSchema: Schema = {
    name: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        },
        isLength: {
            options: {
                min: 1,
                max: 100
            },
            errorMessage: validationMsg.INVALID_LENGTH(1, 100)
        },
        trim: true
    },
    email: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        },
        isEmail: {
            errorMessage: validationMsg.INVALID_EMAIL
        },
        custom: {
            options: async (value) => {
                const isExisted = await usersService.emailExists({ email: value });

                if (Boolean(isExisted)) {
                    throw new ErrorMessageCode({
                        code: hc.CONFLICT,
                        message: validationMsg.EXISTED_EMAIL
                    });
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: validationMsg.PASSWORD_TOO_WEAK
        }
    },
    confirm_password: {
        notEmpty: true,
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: validationMsg.PASSWORD_TOO_WEAK
        },
        custom: {
            options: (value, { req }) => {
                if (value === req.body.password) {
                    return true;
                }
                throw new Error(validationMsg.PASSWORD_MISMATCH);
            }
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: validationMsg.INVALID_DATE
        }
    }
};

export const registerValidator = validator(registerValidatorSchema);

// End Register Middlewares

// Login Middleware

const loginValidatorSchema = checkSchema({
    email: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        },
        isEmail: {
            errorMessage: validationMsg.INVALID_EMAIL
        },
        custom: {
            options: async (value) => {
                const isExisted = await usersService.emailExists({ email: value });

                if (Boolean(isExisted)) {
                    throw new ErrorMessageCode({
                        code: hc.CONFLICT,
                        message: validationMsg.EXISTED_EMAIL
                    });
                }
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        }
    }
});

// End Login Middleware
