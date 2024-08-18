import { loginController, registerController } from '@/controllers/users.controllers';
import { loginLimiter, loginValidator, registerValidator } from '@/middlewares/users.middlewares';
import { asyncHandler } from '@/utils/async-handler';
import express from 'express';

const router = express.Router();

// [POST] /api/users/register
router.post('/register', registerValidator, asyncHandler(registerController));

// [POST] /api/users/login

router.post('/login', loginLimiter, loginValidator, asyncHandler(loginController));

// Export
const usersRouters = router;
export default usersRouters;
