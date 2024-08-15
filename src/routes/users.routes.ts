import { registerController } from '@/controllers/users.controllers';
import express from 'express';

const router = express.Router();

router.post('/register', registerController);

// Export
const userRouter = router;
export default userRouter;
