import serverMsg from '@/constants/messages/server-messages';
import BlackList from '@/schemas/black-list.schema';
import Follower from '@/schemas/follower.schema';
import { RefreshToken } from '@/schemas/refresh-token.schema';
import User from '@/schemas/user.schema';
import 'dotenv/config';
import { Collection, Db, MongoClient } from 'mongodb';

class DatabaseService {
    private static instance: DatabaseService;
    private client: MongoClient;
    private db: Db;

    private constructor(connection_string: string, db_name: string) {
        this.client = new MongoClient(connection_string);
        this.db = this.client.db(db_name);
    }

    public static getInstance(): DatabaseService {
        const connection_string = process.env.CONNECTION_STRING;
        const db_name = process.env.DATABASE_NAME;

        if (!connection_string) {
            throw new Error(serverMsg.CONNECTION_STRING_ERROR);
        }

        if (!db_name) {
            throw new Error(serverMsg.DATABASE_NAME_ERROR);
        }

        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService(connection_string, db_name);
        }

        return DatabaseService.instance;
    }

    public async run() {
        try {
            await this.client.connect();
            await this.db.command({ ping: 1 });
            console.log(serverMsg.DATABASE_CONNECTION_SUCCESS);
        } catch (err) {
            console.log(serverMsg.DATABASE_CONNECTION_FAILURE);
        }
    }

    get users(): Collection<User> {
        const col_name = process.env.DATABASE_USER_COLLECTION;

        if (!col_name) {
            throw new Error(serverMsg.COLLECTION_NAME_ERROR);
        }

        return this.db.collection<User>(col_name);
    }

    get refreshTokens(): Collection<RefreshToken> {
        const col_name = process.env.DATABASE_REFRESH_TOKEN_COLLECTION;
        if (!col_name) {
            throw new Error(serverMsg.COLLECTION_NAME_ERROR);
        }

        return this.db.collection<RefreshToken>(col_name);
    }

    get blackLists(): Collection<BlackList> {
        const col_name = process.env.DATABASE_BLACK_LIST_COLLECTION;

        if (!col_name) {
            throw new Error(serverMsg.COLLECTION_NAME_ERROR);
        }
        return this.db.collection<BlackList>(col_name);
    }

    get followers(): Collection<Follower> {
        const col_name = process.env.DATABASE_FOLLOWER_COLLECTION;

        if (!col_name) {
            throw new Error(serverMsg.COLLECTION_NAME_ERROR);
        }
        return this.db.collection<Follower>(col_name);
    }
}

// Export
const databaseService = DatabaseService.getInstance();
export default databaseService;
