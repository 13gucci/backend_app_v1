import serverMsg from '@/constants/messages/server-messages';
import 'dotenv/config';
import { Db, MongoClient } from 'mongodb';

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
            throw new Error(serverMsg.CONNECTION_STRING_err);
        }

        if (!db_name) {
            throw new Error(serverMsg.DATABASE_NAME_err);
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

            console.log(serverMsg.DATABASEsuccess);
        } catch (err) {
            console.log(serverMsg.DATABASEerr);
        } finally {
            return;
        }
    }
}

const databaseService = DatabaseService.getInstance();
export default databaseService;
