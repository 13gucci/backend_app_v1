import { registerController } from '@/controllers/auth.controllers';
import express from 'express';

const router = express.Router();

// [POST] /register
router.post('/register', registerController);

// Export
const authRouters = router;
export default authRouters;
