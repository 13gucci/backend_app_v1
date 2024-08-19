import { RefreshToken } from '@/schemas/refresh-token.schema';
import databaseService from '@/services/database.service';
import { InsertOneResult, ObjectId, WithId } from 'mongodb';

class RefreshTokenService {
    private static instance: RefreshTokenService;

    private constructor() {}

    public static getInstance(): RefreshTokenService {
        if (!RefreshTokenService.instance) {
            RefreshTokenService.instance = new RefreshTokenService();
        }
        return RefreshTokenService.instance;
    }

    public async createRefreshToken(payload: {
        user_id: string;
        token_string: string;
    }): Promise<InsertOneResult<RefreshToken>> {
        const response = await databaseService.refreshTokens.insertOne(
            new RefreshToken({ token: payload.token_string, user_id: new ObjectId(payload.user_id) })
        );

        return response;
    }

    public async readRefreshToken(payload: { token: string }): Promise<WithId<RefreshToken> | null> {
        const response = await databaseService.refreshTokens.findOne({ token: payload.token });

        return response;
    }

    public async deleteToken(payload: { token: string }) {
        const response = await databaseService.refreshTokens.deleteOne({
            token: payload.token
        });

        return response;
    }
}

const refreshTokenService = RefreshTokenService.getInstance();
export default refreshTokenService;
