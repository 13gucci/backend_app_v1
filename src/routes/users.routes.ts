import { registerController } from '@/controllers/users.controllers';
import { registerValidator } from '@/middlewares/users.middlewares';
import { asyncHandler } from '@/utils/async-handler';
import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

// [POST] /api/users/register
router.post('/register', registerValidator, asyncHandler(registerController));

// [POST] /api/users/login

router.post('/login');
// Export
const usersRouters = router;
export default usersRouters;
