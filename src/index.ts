import serverMsg from '@/constants/messages/server-messages';
import { appErrorHandler } from '@/middlewares/errors.middleware';
import googleRouters from '@/routes/google.routes';
import mediaRouters from '@/routes/media.routes';
import testRouters from '@/routes/test-api.routes';
import usersRouters from '@/routes/users.routes';
import databaseService from '@/services/database.service';
import { initFolder } from '@/utils/file';
import 'dotenv/config';
import express from 'express';
import path from 'path';
const app = express();
const port = process.env.SERVER_PORT;

// Folder
initFolder();

// Database
databaseService.run();
app.use(express.json()); //Parse json in body request JSON -> Object

// [Users] routes
app.use('/api/users', usersRouters);

// [Google] routes
app.use('/api', googleRouters);

// [Upload]
app.use('/api/medias', mediaRouters);

// [TEST] Test server
app.use('/api', testRouters);

// App Error Handler
app.use(appErrorHandler);

app.listen(port, () => {
    console.log(`${serverMsg.SERVER_START_SUCCESS} ${port}`);
});
