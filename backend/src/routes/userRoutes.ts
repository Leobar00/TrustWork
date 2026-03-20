import { Router } from 'express';
import { authenticateWallet } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as userController from '../controllers/userController';

const router = Router();

router.post('/connect', validateRequest(userController.ConnectWalletSchema), userController.connectWallet);

router.get('/me', authenticateWallet, userController.getProfile);

router.get('/balance', authenticateWallet, userController.getWalletBalance);

export default router;
