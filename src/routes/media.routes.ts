import { uploadSingleImageController } from '@/controllers/media.controllers';
import { asyncHandler } from '@/utils/async-handler';
import { Router } from 'express';

const router = Router();

router.post('/upload-image', asyncHandler(uploadSingleImageController));

const mediaRouters = router;
export default mediaRouters;
