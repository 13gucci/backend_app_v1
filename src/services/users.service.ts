import { RegisterReqBody, UpdateMeReqBody } from '@/@types/request.type';
import { eTokenType } from '@/@types/token.type';
import User, { eUserVerifyStatus } from '@/schemas/user.schema';
import databaseService from '@/services/database.service';
import refreshTokenService from '@/services/refresh-token.service';
import { signTokenString } from '@/utils/jwt-sign';
import { generateHashPassword } from '@/utils/utils';
import crypto from 'crypto';
import { Algorithm } from 'jsonwebtoken';
import { ObjectId, WithId } from 'mongodb';

class UsersService {
    private static instance: UsersService;

    private constructor() {}

    public static getInstance(): UsersService {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService();
        }
        return UsersService.instance;
    }

    public async signToken({
        exp,
        private_key,
        my_payload,
        sub
    }: {
        private_key: string;
        exp: string | number | undefined;
        sub: string;
        my_payload: { user_id: string; token_type: eTokenType; verify: eUserVerifyStatus };
    }) {
        const token = await signTokenString({
            privateKey: private_key,
            options: {
                algorithm: process.env.ALG_TOKEN as Algorithm,
                jwtid: crypto.randomUUID(),
                issuer: process.env.SERVER_URL,
                audience: process.env.SERVER_URL,
                subject: sub,
                expiresIn: exp
            },
            payload: {
                ...my_payload
            }
        });

        return token;
    }

    public async emailExists(payload: { email: string }): Promise<WithId<User> | null> {
        const response = await databaseService.users.findOne({ email: payload.email });

        return response;
    }

    public async readUser(payload: { _id: string; protect_fields?: (keyof User)[] }): Promise<WithId<User> | null> {
        const protects: { [key: string]: number } = {};

        if (payload.protect_fields && Array.isArray(payload.protect_fields)) {
            payload.protect_fields.forEach((field) => {
                protects[field as string] = 0;
            });
        }

        const resposne = await databaseService.users.findOne(
            { _id: new ObjectId(payload._id) },
            {
                projection: protects
            }
        );

        return resposne;
    }

    public async register(payload: { user: Omit<RegisterReqBody, 'confirm_password'> }): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        const user_id = new ObjectId();
        const { user } = payload;

        const passwordHashed = await generateHashPassword({ myPlaintextPassword: user.password });

        const [access_token, refresh_token, email_verify_token] = await Promise.all([
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.ACCESS_PRIVATE_KEY as string,
                my_payload: {
                    user_id: user_id.toString(),
                    token_type: eTokenType.ACCESS_TOKEN,
                    verify: eUserVerifyStatus.Unverified
                },
                sub: user_id.toString()
            }),
            this.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.REFRESH_PRIVATE_KEY as string,
                my_payload: {
                    user_id: user_id.toString(),
                    token_type: eTokenType.REFRESH_TOKEN,
                    verify: eUserVerifyStatus.Unverified
                },
                sub: user_id.toString()
            }),
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.VERIFY_EMAIL_PRIVATE_KEY as string,
                my_payload: {
                    user_id: user_id.toString(),
                    token_type: eTokenType.EMAIL_VERIFY_TOKEN,
                    verify: eUserVerifyStatus.Unverified
                },
                sub: user_id.toString()
            })
        ]);

        const newUser = {
            ...user,
            _id: user_id,
            date_of_birth: new Date(user.date_of_birth),
            password: passwordHashed,
            email_verify_token
        };

        const response = await databaseService.users.insertOne(new User(newUser));
        return {
            access_token,
            refresh_token
        };
    }

    public async login(payload: { user_id: string; verify: eUserVerifyStatus }): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        const [access_token, refresh_token] = await Promise.all([
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.ACCESS_PRIVATE_KEY as string,
                my_payload: {
                    user_id: payload.user_id,
                    token_type: eTokenType.ACCESS_TOKEN,
                    verify: payload.verify
                },
                sub: payload.user_id
            }),
            this.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.REFRESH_PRIVATE_KEY as string,
                my_payload: {
                    user_id: payload.user_id,
                    token_type: eTokenType.REFRESH_TOKEN,
                    verify: eUserVerifyStatus.Unverified
                },
                sub: payload.user_id
            })
        ]);

        await refreshTokenService.createRefreshToken({
            token_string: refresh_token,
            user_id: payload.user_id
        });

        return {
            access_token,
            refresh_token
        };
    }

    public async logout(payload: { token: string }): Promise<{
        message: string;
    }> {
        await refreshTokenService.deleteToken({ token: payload.token });

        return {
            message: 'Logout successfully'
        };
    }

    public async verifyEmail(payload: { user_id: string }) {
        await databaseService.users.updateOne(
            {
                _id: new ObjectId(payload.user_id)
            },
            {
                $set: {
                    email_verify_token: '',
                    verify: eUserVerifyStatus.Verified
                },
                $currentDate: {
                    updated_at: true
                }
            }
        );

        return {
            message: 'Verify successfully.'
        };
    }

    public async readVerifyEmailToken(payload: { user_id: string; token: string }) {
        const response = await databaseService.users.findOne({
            _id: new ObjectId(payload.user_id),
            email_verify_token: payload.token
        });

        return Boolean(response);
    }

    public async readVerifyPasswordToken(payload: { user_id: string; token: string }) {
        const response = await databaseService.users.findOne({
            _id: new ObjectId(payload.user_id),
            forgot_password_token: payload.token
        });

        return response;
    }

    public async resendVerifyEmailToken(payload: { user_id: string }) {
        const email_verify_token = await this.signToken({
            exp: process.env.EXP_ACCESS_TOKEN,
            private_key: process.env.VERIFY_EMAIL_PRIVATE_KEY as string,
            my_payload: {
                user_id: payload.user_id,
                token_type: eTokenType.EMAIL_VERIFY_TOKEN,
                verify: eUserVerifyStatus.Unverified
            },
            sub: payload.user_id
        });

        await databaseService.users.updateOne(
            {
                _id: new ObjectId(payload.user_id)
            },
            {
                $set: {
                    email_verify_token: email_verify_token
                },
                $currentDate: {
                    updated_at: true
                }
            }
        );

        return {
            message: 'Resend email verify successfully.'
        };
    }

    public async updateForgotPasswordToken(payload: { user_id: string; verify: eUserVerifyStatus }) {
        const forgot_password_token = await this.signToken({
            exp: process.env.EXP_FORGOT_PASSWORD_TOKEN,
            private_key: process.env.FORGOT_PASSWORD_PRIVATE_KEY as string,
            my_payload: {
                user_id: payload.user_id,
                token_type: eTokenType.FORGOT_PASSWORD_TOKEN,
                verify: eUserVerifyStatus.Unverified
            },
            sub: payload.user_id
        });

        await databaseService.users.updateOne(
            {
                _id: new ObjectId(payload.user_id)
            },
            {
                $set: {
                    forgot_password_token: forgot_password_token
                },
                $currentDate: {
                    updated_at: true
                }
            }
        );

        //Send email with link to email user

        return {
            message: 'Check email for reset pass'
        };
    }

    public async verifyForgotPasswordToken() {}

    public async resetPassword(payload: { user_id: string; new_password: string }) {
        const new_hash_password = await generateHashPassword({ myPlaintextPassword: payload.new_password });
        await databaseService.users.updateOne(
            {
                _id: new ObjectId(payload.user_id)
            },
            {
                $set: {
                    forgot_password_token: '',
                    password: new_hash_password
                },
                $currentDate: {
                    updated_at: true
                }
            }
        );

        return {
            message: 'Reset password success'
        };
    }

    public async updateMe(payload: { user_id: string; body: UpdateMeReqBody }) {
        const _body = payload.body.date_of_birth
            ? { ...payload.body, date_of_birth: new Date(payload.body.date_of_birth) }
            : payload.body;

        const response = await databaseService.users.findOneAndUpdate(
            {
                _id: new ObjectId(payload.user_id)
            },
            {
                $set: {
                    ...(_body as UpdateMeReqBody & { date_of_birth: Date })
                },
                $currentDate: {
                    updated_at: true
                }
            },
            {
                returnDocument: 'after',
                projection: {
                    password: 0,
                    email_verify_token: 0,
                    forgot_password_token: 0
                }
            }
        );

        return response;
    }
}

// Export
const usersService = UsersService.getInstance();
export default usersService;
