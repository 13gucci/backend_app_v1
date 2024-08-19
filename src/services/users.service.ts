import { RegisterReqBody } from '@/@types/request.type';
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
        token_type,
        sub
    }: {
        private_key: string;
        exp: string | number | undefined;
        sub: string;
        token_type: eTokenType;
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
            payload: { token_type }
        });

        return token;
    }

    public async emailExists(payload: { email: string }): Promise<WithId<User> | null> {
        const response = await databaseService.users.findOne({ email: payload.email });

        return response;
    }

    public async readUser(payload: { _id: string }): Promise<WithId<User> | null> {
        const resposne = await databaseService.users.findOne({ _id: new ObjectId(payload._id) });

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
                token_type: eTokenType.ACCESS_TOKEN,
                sub: user_id.toString()
            }),
            this.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.REFRESH_PRIVATE_KEY as string,
                token_type: eTokenType.REFRESH_TOKEN,
                sub: user_id.toString()
            }),
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.VERIFY_EMAIL_PRIVATE_KEY as string,
                token_type: eTokenType.EMAIL_VERIFY_TOKEN,
                sub: user_id.toString()
            })
        ]);

        console.log(email_verify_token);

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

    public async login(payload: { user_id: string }): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        const [access_token, refresh_token] = await Promise.all([
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.ACCESS_PRIVATE_KEY as string,
                token_type: eTokenType.ACCESS_TOKEN,
                sub: payload.user_id
            }),
            this.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.REFRESH_PRIVATE_KEY as string,
                token_type: eTokenType.REFRESH_TOKEN,
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
                }
            }
        );

        return {
            message: 'Verify successfully.'
        };
    }
}

// Export
const usersService = UsersService.getInstance();
export default usersService;
