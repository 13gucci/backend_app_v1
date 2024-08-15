import User from '@/models/schemas/user.schema';
import databaseService from '@/services/database.service';

class UsersService {
    private static instance: UsersService;

    private constructor() {}

    public static getInstance(): UsersService {
        if (!UsersService.instance) {
            UsersService.instance = new UsersService();
        }
        return UsersService.instance;
    }

    public async register(payload: { user: User }) {
        const response = await databaseService.users.insertOne(payload.user);

        return response;
    }
}

// Export
const usersService = UsersService.getInstance();
export default usersService;
