import serverMsg from '@/constants/messages/server-messages';
import authRouters from '@/routes/auth.routes';
import databaseService from '@/services/database.service';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.SERVER_PORT;
databaseService.run();

app.use(express.json()); //Parse json in body request JSON -> Object

// [Authentication & Authorization] routes
app.use('/api/auth', authRouters);

// [GET] Test server
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: serverMsg.SERVER_HEALTH_CHECK_SUCCESS
    });
});

app.listen(port, () => {
    console.log(`${serverMsg.SERVER_START_SUCCESS} ${port}`);
});
