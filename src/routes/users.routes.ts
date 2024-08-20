import { UpdateMeReqBody } from '@/@types/request.type';
import {
    emailVerifyController,
    followController,
    forgotPasswordController,
    getMeController,
    getUserController,
    loginController,
    logoutController,
    registerController,
    resendEmailVerifyController,
    resetPasswordController,
    unfollowController,
    updateMeController,
    verifyForgotPasswordTokenController
} from '@/controllers/users.controllers';
import { filterMiddleware } from '@/middlewares/common.middleware';
import {
    accessTokenValidator,
    followValidator,
    forgotPasswordValidator,
    loginValidator,
    refreshTokenValidator,
    registerValidator,
    requestLimiter,
    resetPasswordValidator,
    unfollowValidator,
    updateMeValidator,
    verifyEmailValidator,
    verifyForgotPasswordValidator,
    verifyUserValidator
} from '@/middlewares/users.middlewares';
import { asyncHandler } from '@/utils/async-handler';
import express from 'express';

const router = express.Router();

// [POST] /api/users/register
router.post('/register', requestLimiter, registerValidator, asyncHandler(registerController));

// [POST] /api/users/login
router.post('/login', requestLimiter, loginValidator, asyncHandler(loginController));

// [POST] /api/users/logout
router.post('/logout', requestLimiter, accessTokenValidator, refreshTokenValidator, asyncHandler(logoutController));

// [POST] /api/users/verify-email
router.post('/verify-email', requestLimiter, verifyEmailValidator, asyncHandler(emailVerifyController));

// [POST] /api/users/resend-verify-email
router.post('/resend-verify-email', requestLimiter, accessTokenValidator, asyncHandler(resendEmailVerifyController));

// [POST] /api/users/forgot-password
router.post('/forgot-password', requestLimiter, forgotPasswordValidator, asyncHandler(forgotPasswordController));

// [POST] /api/users/verify-forgot-password
router.post(
    '/verify-forgot-password',
    requestLimiter,
    verifyForgotPasswordValidator,
    verifyForgotPasswordTokenController
);

// [POST] /api/users/reset-password
router.post('/reset-password', requestLimiter, resetPasswordValidator, asyncHandler(resetPasswordController));

// [GET] /api/users/me
router.get('/me', accessTokenValidator, asyncHandler(getMeController));

// [PATCH] /api/users/me
router.patch(
    '/me',
    accessTokenValidator,
    verifyUserValidator,
    updateMeValidator,
    filterMiddleware<UpdateMeReqBody>(['avatar', 'bio', 'cover_photo', 'date_of_birth', 'location', 'name', 'website']),
    asyncHandler(updateMeController)
);

// [GET] /api/users/:username
router.get('/:username', asyncHandler(getUserController));

// [POST] /api/users/follow
router.post('/follow', accessTokenValidator, verifyUserValidator, followValidator, asyncHandler(followController));

// [POST] /api/users/unfollow
router.delete(
    '/follow/:followed_user_id',
    accessTokenValidator,
    verifyUserValidator,
    unfollowValidator,
    asyncHandler(unfollowController)
);

// Export
const usersRouters = router;
export default usersRouters;
