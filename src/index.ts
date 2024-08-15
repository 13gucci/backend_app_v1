import serverMsg from '@/constants/messages/server-messages';
import userRouters from '@/routes/users.routes';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json()); //Parse json in body request JSON -> Object

app.use('/api', userRouters);

// [GET] Test server
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: serverMsg.TEST
    });
});

app.listen(port, () => {
    console.log(`${serverMsg.SERVER} ${port}`);
});
