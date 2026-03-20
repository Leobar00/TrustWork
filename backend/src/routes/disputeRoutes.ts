import { Router } from 'express';
import { authenticateWallet } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as disputeController from '../controllers/disputeController';

const router = Router();

router.post('/', authenticateWallet, validateRequest(disputeController.RaiseDisputeSchema), disputeController.raiseDispute);

router.get('/:id', authenticateWallet, disputeController.getDispute);

router.post('/:id/respond', authenticateWallet, validateRequest(disputeController.RespondToDisputeSchema), disputeController.respondToDispute);

router.post('/:id/resolve', authenticateWallet, disputeController.resolveDispute);

export default router;
