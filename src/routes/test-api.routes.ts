import serverMsg from '@/constants/messages/server-messages';
import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
    res.status(200).json({
        message: serverMsg.SERVER_HEALTH_CHECK_SUCCESS
    });
});

// Export
const testRouters = router;
export default testRouters;
