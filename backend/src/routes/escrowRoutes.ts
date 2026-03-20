import { Router } from 'express';
import { authenticateWallet } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as escrowController from '../controllers/escrowController';

const router = Router();

router.post('/lock', authenticateWallet, validateRequest(escrowController.LockFundsSchema), escrowController.lockFunds);

router.post('/release', authenticateWallet, validateRequest(escrowController.ReleaseFundsSchema), escrowController.releaseFunds);

router.post('/refund', authenticateWallet, validateRequest(escrowController.RefundFundsSchema), escrowController.refundFunds);

router.get('/:taskId', authenticateWallet, escrowController.getEscrowStatus);

export default router;
