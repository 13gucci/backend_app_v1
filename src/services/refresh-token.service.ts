import { RefreshToken } from '@/schemas/refresh-token.schema';
import databaseService from '@/services/database.service';
import { InsertOneResult, ObjectId } from 'mongodb';

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
}

const refreshTokenService = RefreshTokenService.getInstance();
export default refreshTokenService;
