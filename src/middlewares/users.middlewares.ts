import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import serverMsg from '@/constants/messages/server-messages';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import refreshTokenService from '@/services/refresh-token.service';
import usersService from '@/services/users.service';
import { verifyTokenString } from '@/utils/jwt-sign';
import validator from '@/utils/request-validator';
import { comparePassword, validateBearerToken } from '@/utils/utils';
import { Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { Schema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';

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
                const user = await usersService.emailExists({ email: value });

                if (Boolean(user)) {
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

export const registerValidator = validator(registerValidatorSchema, ['body']);
// End Register Middlewares

// Login Middleware
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes,
    limit: 10, // 10 times for login
    standardHeaders: 'draft-7',
    handler: (req, res, next) => {
        next(
            new ErrorMessageCode({
                code: hc.TOO_MANY_REQUESTS,
                message: serverMsg.REACHED_LIMIT_REQUEST_LOGIN
            })
        );
    }
});

const loginValidatorSchema: Schema = {
    email: {
        trim: true,
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        },
        isEmail: {
            errorMessage: validationMsg.INVALID_EMAIL
        },
        custom: {
            options: async (value, { req }) => {
                const user = await usersService.emailExists({ email: value });

                if (!user) {
                    throw new ErrorMessageCode({
                        code: hc.UNAUTHORIZED,
                        message: authMsg.FAILURE.LOGIN
                    });
                }

                const isValidPassword = await comparePassword(req.body.password, user.password);

                if (!isValidPassword) {
                    throw new ErrorMessageCode({
                        code: hc.UNAUTHORIZED,
                        message: authMsg.FAILURE.LOGIN
                    });
                }

                req.user = user;
                return true;
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: validationMsg.REQUIRED
        }
    }
};

export const loginValidator = validator(loginValidatorSchema, ['body']);
// End Login Middleware

// Token Middleware
const accessTokenValidatorSchema: Schema = {
    authorization: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new ErrorMessageCode({
                        code: hc.UNAUTHORIZED,
                        message: authMsg.FAILURE.UNAUTHORIZED
                    });
                }

                //Throw error of Error then request_validator will catch
                try {
                    const tokenValue = validateBearerToken(value);
                    const payload_access_token_decoded = await verifyTokenString({
                        privateKey: process.env.ACCESS_PRIVATE_KEY as string,
                        token: tokenValue
                    });

                    (req as Request).payload_access_token_decoded = payload_access_token_decoded;
                } catch (error) {
                    if (error instanceof JsonWebTokenError) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: error.message
                        });
                    }
                    throw error;
                }

                return true;
            }
        }
    }
};

export const accessTokenValidator = validator(accessTokenValidatorSchema, ['headers']);

const refreshTokenValidatorSchema: Schema = {
    refresh_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new ErrorMessageCode({
                        code: hc.UNAUTHORIZED,
                        message: authMsg.FAILURE.UNAUTHORIZED
                    });
                }

                try {
                    const tokenValue = validateBearerToken(value);
                    const [isExistToken, payload_refresh_token_decoded] = await Promise.all([
                        refreshTokenService.readRefreshToken({ token: tokenValue }),
                        verifyTokenString({
                            privateKey: process.env.REFRESH_PRIVATE_KEY as string,
                            token: tokenValue
                        })
                    ]);

                    if (isExistToken === null) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: 'Refresh token is used or not valid'
                        });
                    }

                    (req as Request).payload_refresh_token_decoded = payload_refresh_token_decoded;
                } catch (error) {
                    if (error instanceof JsonWebTokenError) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: error.message
                        });
                    }
                    throw error;
                }

                return true;
            }
        }
    }
};
export const refreshTokenValidator = validator(refreshTokenValidatorSchema, ['body']);

const verifyEmailTokenValidatorSchema: Schema = {
    email_verify_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new ErrorMessageCode({
                        code: hc.UNAUTHORIZED,
                        message: authMsg.FAILURE.UNAUTHORIZED
                    });
                }

                try {
                    const payload_email_verify_decoded = await verifyTokenString({
                        privateKey: process.env.VERIFY_EMAIL_PRIVATE_KEY as string,
                        token: value
                    });

                    (req as Request).payload_email_verify_decoded = payload_email_verify_decoded;
                } catch (error) {
                    if (error instanceof JsonWebTokenError) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: error.message
                        });
                    }
                    throw error;
                }

                return true;
            }
        }
    }
};
export const verifyEmailValidator = validator(verifyEmailTokenValidatorSchema, ['body']);

// End Token Middleware
