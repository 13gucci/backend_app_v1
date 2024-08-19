import {
    emailVerifyController,
    forgotPasswordController,
    loginController,
    logoutController,
    registerController,
    resendEmailVerifyController
} from '@/controllers/users.controllers';
import {
    accessTokenValidator,
    requestLimiter,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    verifyEmailValidator,
    forgotPasswordValidator
} from '@/middlewares/users.middlewares';
import { asyncHandler } from '@/utils/async-handler';
import express from 'express';

const router = express.Router();

// [POST] /api/users/register
router.post('/register', requestLimiter, registerValidator, asyncHandler(registerController));

// [POST] /api/users/login
router.post('/login', requestLimiter, loginValidator, asyncHandler(loginController));

// [POST] /api/users/logout
router.post('/logout', accessTokenValidator, refreshTokenValidator, asyncHandler(logoutController));

// [POST] /api/users/verify-email
router.post('/verify-email', requestLimiter, verifyEmailValidator, asyncHandler(emailVerifyController));

// [POST] /api/users/resend-verify-email
router.post('/resend-verify-email', requestLimiter, accessTokenValidator, asyncHandler(resendEmailVerifyController));

// [POST] /api/users/forgot-password
router.post('/forgot-password', requestLimiter, forgotPasswordValidator, asyncHandler(forgotPasswordController));

// Export
const usersRouters = router;
export default usersRouters;
