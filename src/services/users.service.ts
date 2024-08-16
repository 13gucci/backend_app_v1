import { RegisterReqBody } from '@/@types/register.type';
import { eTokenType } from '@/@types/token.type';
import crypto from 'crypto';
import User from '@/schemas/user.schema';
import databaseService from '@/services/database.service';
import { signTokenString } from '@/utils/jwt-sign';
import { generateHashPassword } from '@/utils/utils';
import { Algorithm } from 'jsonwebtoken';
import { InsertOneResult, WithId } from 'mongodb';

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

    public async register(payload: { user: Omit<RegisterReqBody, 'confirm_password'> }) {
        const { user } = payload;

        const passwordHashed = await generateHashPassword({ myPlaintextPassword: user.password });
        const newUser = { ...user, date_of_birth: new Date(user.date_of_birth), password: passwordHashed };

        const response = await databaseService.users.insertOne(new User(newUser));

        const [access_token, refresh_token] = await Promise.all([
            this.signToken({
                exp: process.env.EXP_ACCESS_TOKEN,
                private_key: process.env.JWT_PRIVATE_KEY as string,
                token_type: eTokenType.ACCESS_TOKEN,
                sub: response.insertedId.toString()
            }),
            this.signToken({
                exp: process.env.EXP_REFRESH_TOKEN,
                private_key: process.env.JWT_PRIVATE_KEY as string,
                token_type: eTokenType.REFRESH_TOKEN,
                sub: response.insertedId.toString()
            })
        ]);

        return {
            access_token,
            refresh_token
        };
    }

    public async emailExists(payload: { email: string }): Promise<WithId<User> | null> {
        const response = await databaseService.users.findOne({ email: payload.email });

        return response;
    }
}

// Export
const usersService = UsersService.getInstance();
export default usersService;
