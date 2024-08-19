import { tJWTPayload } from '@/@types/jwt.type';
import User from '@/schemas/user.schema';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
    interface Request {
        user?: User;
        payload_access_token_decoded?: JwtPayload;
        payload_refresh_token_decoded?: JwtPayload;
        payload_email_verify_decoded?: JwtPayload;
        payload_forgot_password_token_decoded?: JwtPayload;
    }
}
