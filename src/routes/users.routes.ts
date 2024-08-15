import { loginController } from '@/controllers/users.controllers';
import { loginValidator } from '@/middlewares/users.middlewares';
import express from 'express';

const router = express.Router();

router.post('/login', loginValidator, loginController);

//Export
const userRouter = router;
export default userRouter;
