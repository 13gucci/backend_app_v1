import hc from '@/constants/http-status-codes';
import authMsg from '@/constants/messages/auth-messages';
import serverMsg from '@/constants/messages/server-messages';
import { validationMsg } from '@/constants/messages/validation-messages';
import { ErrorMessageCode } from '@/schemas/errors.schema';
import { eUserVerifyStatus } from '@/schemas/user.schema';
import refreshTokenService from '@/services/refresh-token.service';
import usersService from '@/services/users.service';
import { verifyTokenString } from '@/utils/jwt-sign';
import validator from '@/utils/request-validator';
import { comparePassword, validateBearerToken } from '@/utils/utils';
import { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { Schema } from 'express-validator';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

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
export const requestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes,
    limit: 100, // 10 times for login
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

                    const isValidEmailVerifyToken = await usersService.readVerifyEmailToken({
                        token: value,
                        user_id: payload_email_verify_decoded.sub as string
                    });

                    if (!isValidEmailVerifyToken) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: 'Email verify token is invalid or already verified'
                        });
                    }

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

// Forgot password middleware

export const forgotPasswordValidatorSchema: Schema = {
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
                        code: hc.NOT_FOUND,
                        message: validationMsg.USER_NOTFOUND
                    });
                }

                (req as Request).user = user;

                return true;
            }
        }
    }
};

export const forgotPasswordValidator = validator(forgotPasswordValidatorSchema, ['body']);

export const verifyForgotPasswordValidatorSchema: Schema = {
    verify_forgot_password_token: {
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
                    const payload_forgot_password_token_decoded = await verifyTokenString({
                        privateKey: process.env.FORGOT_PASSWORD_PRIVATE_KEY as string,
                        token: value
                    });

                    const user = await usersService.readUser({
                        _id: payload_forgot_password_token_decoded.sub as string
                    });

                    if (!user) {
                        throw new ErrorMessageCode({
                            code: hc.NOT_FOUND,
                            message: validationMsg.USER_NOTFOUND
                        });
                    }

                    if (user.forgot_password_token !== value) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: authMsg.FAILURE.UNAUTHORIZED
                        });
                    }

                    (req as Request).user = user;
                } catch (error) {
                    if (error instanceof JsonWebTokenError) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: error.message
                        });
                        throw error;
                    }
                }

                return true;
            }
        }
    }
};

export const verifyForgotPasswordValidator = validator(verifyForgotPasswordValidatorSchema);

export const resetPasswordValidatorSchema: Schema = {
    new_password: {
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
                if (value === req.body.new_password) {
                    return true;
                }
                throw new Error(validationMsg.PASSWORD_MISMATCH);
            }
        }
    },
    verify_forgot_password_token: {
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
                    const payload_forgot_password_token_decoded = await verifyTokenString({
                        privateKey: process.env.FORGOT_PASSWORD_PRIVATE_KEY as string,
                        token: value
                    });

                    (req as Request).payload_forgot_password_token_decoded = payload_forgot_password_token_decoded;

                    const user = await usersService.readUser({
                        _id: payload_forgot_password_token_decoded.sub as string
                    });

                    if (!user) {
                        throw new ErrorMessageCode({
                            code: hc.NOT_FOUND,
                            message: validationMsg.USER_NOTFOUND
                        });
                    }

                    if (user.forgot_password_token !== value) {
                        throw new ErrorMessageCode({
                            code: hc.UNAUTHORIZED,
                            message: authMsg.FAILURE.UNAUTHORIZED
                        });
                    }
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

export const resetPasswordValidator = validator(resetPasswordValidatorSchema, ['body']);
// End forgot password middleware

// update me validator middleware
// Nếu synchronous middleware ta chỉ cần throw,
// Nếu là asynchrounous ta cần next
export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
    const { verify } = req.payload_access_token_decoded as JwtPayload;

    if (verify !== eUserVerifyStatus.Verified) {
        return next(
            new ErrorMessageCode({
                code: hc.FORBIDDEN,
                message: authMsg.FAILURE.UNVERIFY
            })
        );
    }

    return next();
};

// name?: string;
// date_of_birth?: string;
// bio?: string;
// location?: string;
// website?: string;
// avatar?: string;
// username?: string;
// cover_photo?: string;

const updateMeValidatorSchema: Schema = {
    name: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Name')
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
    date_of_birth: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Date of Birth')
        },
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: validationMsg.INVALID_DATE
        }
    },
    bio: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Bio')
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
    location: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Location')
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
    website: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Website')
        },
        isURL: {
            options: {
                protocols: ['http', 'https'],
                require_protocol: true
            },
            errorMessage: validationMsg.INVALID_URL
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
    avatar: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Avatar')
        },
        isURL: {
            options: {
                protocols: ['http', 'https'],
                require_protocol: true
            },
            errorMessage: validationMsg.INVALID_URL
        }
    },
    username: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Username')
        },
        isLength: {
            options: {
                min: 3,
                max: 30
            },
            errorMessage: validationMsg.INVALID_LENGTH(3, 30)
        },
        trim: true,
        matches: {
            options: /^[a-zA-Z0-9_]+$/,
            errorMessage: validationMsg.INVALID_USERNAME_FORMAT
        }
    },
    cover_photo: {
        optional: true,
        isString: {
            errorMessage: validationMsg.INVALID_STRING('Cover Photo')
        },
        isURL: {
            options: {
                protocols: ['http', 'https'],
                require_protocol: true
            },
            errorMessage: validationMsg.INVALID_URL
        }
    }
};

export const updateMeValidator = validator(updateMeValidatorSchema, ['body']);
// End update me validator middleware

// Follow | unfollow validator middleware

const followValidatorSchema: Schema = {
    followed_user_id: {
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new ErrorMessageCode({
                        code: hc.NOT_FOUND,
                        message: 'Followered id is required'
                    });
                }

                const user = await usersService.readUser({ _id: value });

                if (!user) {
                    throw new ErrorMessageCode({
                        code: hc.NOT_FOUND,
                        message: validationMsg.USER_NOTFOUND
                    });
                }

                return true;
            }
        }
    }
};

export const followValidator = validator(followValidatorSchema, ['body']);

const unfollowVadilatorSchema: Schema = {
    followed_user_id: {
        custom: {
            options: async (value) => {
                if (!value) {
                    throw new ErrorMessageCode({
                        code: hc.BAD_REQUEST,
                        message: 'Followed_user_id is missing'
                    });
                }

                const user = await usersService.readUser({ _id: value });

                if (!user) {
                    throw new ErrorMessageCode({
                        code: hc.NOT_FOUND,
                        message: validationMsg.USER_NOTFOUND
                    });
                }

                return true;
            }
        }
    }
};

export const unfollowValidator = validator(unfollowVadilatorSchema, ['params']);

// End Follow | unfollow validator middleware
