import { RegisterReqBody } from '@/@types/register.type';
import User from '@/schemas/user.schema';
import databaseService from '@/services/database.service';
import { generateHashPass } from '@/utils/uitls';
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

    public async register(payload: { user: Omit<RegisterReqBody, 'confirm_password'> }): Promise<InsertOneResult<User>> {
        const passwordHashed = await generateHashPass(payload.user.password, 10);
        const newUser = { ...payload.user, date_of_birth: new Date(payload.user.date_of_birth), password: passwordHashed };

        const response = await databaseService.users.insertOne(new User(newUser));

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
