import User from '@/schemas/user.schema';
import databaseService from '@/services/database.service';

class AuthService {
    private static instance: AuthService;

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async register(payload: { user: User }) {
        const response = await databaseService.users.insertOne(payload.user);

        return response;
    }
}

// Export
const authService = AuthService.getInstance();
export default authService;
