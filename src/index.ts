import serverMsg from '@/constants/messages/server-messages';
import { appErrorHandler } from '@/middlewares/errors.middleware';
import testRouters from '@/routes/test.routes';
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

// [GET] Test server
app.get('/api', testRouters);

// App Error Handler
app.use(appErrorHandler);

app.listen(port, () => {
    console.log(`${serverMsg.SERVER_START_SUCCESS} ${port}`);
});
