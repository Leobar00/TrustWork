import { Router } from 'express';
import { authenticateWallet } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import * as taskController from '../controllers/taskController';

const router = Router();

router.post('/', authenticateWallet, validateRequest(taskController.CreateTaskSchema), taskController.createTask);

router.get('/', authenticateWallet, taskController.listTasks);

router.get('/:id', authenticateWallet, taskController.getTask);

router.post('/:id/assign', authenticateWallet, validateRequest(taskController.AssignFreelancerSchema), taskController.assignFreelancer);

export default router;
