import serverMsg from '@/constants/messages/server-messages';
import { appErrorHandler } from '@/middlewares/errors.middleware';
import googleRouters from '@/routes/google.routes';
import testRouters from '@/routes/test-api.routes';
import usersRouters from '@/routes/users.routes';
import databaseService from '@/services/database.service';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.SERVER_PORT;

databaseService.run();
app.use(express.json()); //Parse json in body request JSON -> Object

// [Users] routes
app.use('/api/users', usersRouters);

// [Google] routes
app.use('/api', googleRouters);

// [GET] Test server
app.use('/api', testRouters);

// App Error Handler
app.use(appErrorHandler);

app.listen(port, () => {
    console.log(`${serverMsg.SERVER_START_SUCCESS} ${port}`);
});
