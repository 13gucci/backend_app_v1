import serverMsg from '@/constant/messages/server-messages';
import 'dotenv/config';
import express from 'express';

const app = express();
const port = 4000;

// [GET] Test server
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: serverMsg.TEST
    });
});

app.listen(port, () => {
    console.log(`${serverMsg.SERVER} ${port}`);
});
