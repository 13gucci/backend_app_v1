import express from 'express';
import messages from '@/constant/messages';
import 'dotenv/config';

const app = express();
const port = 4000;

// [GET] Test server
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: messages.APP.TEST
    });
});

app.listen(port, () => {
    console.log(`${messages.APP.SERVER} ${port}`);
});
