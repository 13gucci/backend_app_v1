import {
    emailVerifyController,
    loginController,
    logoutController,
    registerController
} from '@/controllers/users.controllers';
import {
    accessTokenValidator,
    loginLimiter,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    verifyEmailValidator
} from '@/middlewares/users.middlewares';
import { asyncHandler } from '@/utils/async-handler';
import express from 'express';

const router = express.Router();

// [POST] /api/users/register
router.post('/register', registerValidator, asyncHandler(registerController));

// [POST] /api/users/login
router.post('/login', loginLimiter, loginValidator, asyncHandler(loginController));

// [POST] /api/users/logout
router.post('/logout', accessTokenValidator, refreshTokenValidator, asyncHandler(logoutController));

// [POST] /api/users/verify-email
router.post('/verify-email', verifyEmailValidator, asyncHandler(emailVerifyController));

// Export
const usersRouters = router;
export default usersRouters;
