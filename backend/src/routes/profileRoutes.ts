import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { requireAuth } from '../middleware/auth';
import { resumeUpload } from '../middleware/upload';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema } from '../validators/profileValidator';

const router = Router();

router.use(requireAuth);

router.get('/me', profileController.getMyProfile);
router.put('/me', validateBody(updateProfileSchema), profileController.updateMyProfile);
router.post('/resume', resumeUpload.single('resume'), profileController.uploadResume);
router.get('/resume', profileController.downloadResume);

export default router;

