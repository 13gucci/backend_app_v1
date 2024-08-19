import User from '@/schemas/user.schema';
import { Request } from 'express';

declare module 'express' {
    interface Request {
        user?: User;
        payload_access_token_decoded?: tJWTPayload;
        payload_refresh_token_decoded?: tJWTPayload;
    }
}
