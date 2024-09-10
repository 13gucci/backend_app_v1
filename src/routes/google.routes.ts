import { oauthController } from '@/controllers/google.controllers';
import { asyncHandler } from '@/utils/async-handler';
import { Router } from 'express';

const router = Router();

// [GET] /api/oauth/google
router.get('/oauth/google', asyncHandler(oauthController));

const googleRouters = router;
export default googleRouters;
