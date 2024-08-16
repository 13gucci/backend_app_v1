import User from '@/schemas/user.schema';
import databaseService from '@/services/database.service';
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

    public async register(payload: { user: User }): Promise<InsertOneResult<User>> {
        const response = await databaseService.users.insertOne(payload.user);

        return response;
    }

    public async emailExists(payload: { email: string }): Promise<WithId<User> | null> {
        const response = await databaseService.users.findOne({ email: payload.email });

        return response;
    }
}

// Export
const usersService = UsersService.getInstance();
export default usersService;
