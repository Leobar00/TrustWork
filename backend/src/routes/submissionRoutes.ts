import { Router } from 'express';
import { authenticateWallet } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as submissionController from '../controllers/submissionController';

const router = Router();

router.post('/', authenticateWallet, validateRequest(submissionController.SubmitWorkSchema), submissionController.submitWork);

router.get('/:id', authenticateWallet, submissionController.getSubmission);

router.post('/:id/validate', authenticateWallet, submissionController.validateSubmission);

export default router;
