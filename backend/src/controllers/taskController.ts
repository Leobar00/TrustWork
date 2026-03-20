import { Response } from 'express';
import { z } from 'zod';
import { Task, User, Escrow } from '../models';
import { TaskStatus } from '../models/Task';
import { EscrowStatus } from '../models/Escrow';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, budget } = req.body;

    const task = await Task.create({
      clientId: req.user!.id,
      title,
      description,
      budget,
      status: TaskStatus.OPEN,
    });

    const escrow = await Escrow.create({
      taskId: task.id,
      amount: budget,
      status: EscrowStatus.PENDING,
    });

    console.log(`📝 New task created: ${task.id} - ${title}`);

    res.status(201).json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        budget: task.budget,
        status: task.status,
        createdAt: task.createdAt,
      },
      escrow: {
        id: escrow.id,
        status: escrow.status,
        amount: escrow.amount,
      },
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', details: error.message });
  }
};

export const listTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, role } = req.query;

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (role === 'client') {
      whereClause.clientId = req.user!.id;
    } else if (role === 'freelancer') {
      whereClause.freelancerId = req.user!.id;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'client', attributes: ['id', 'walletAddress', 'reputationScore'] },
        { model: User, as: 'freelancer', attributes: ['id', 'walletAddress', 'reputationScore'] },
        { model: Escrow, as: 'escrow' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: any) {
    console.error('List tasks error:', error);
    res.status(500).json({ error: 'Failed to list tasks', details: error.message });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'client', attributes: ['id', 'walletAddress', 'reputationScore'] },
        { model: User, as: 'freelancer', attributes: ['id', 'walletAddress', 'reputationScore'] },
        { model: Escrow, as: 'escrow' },
      ],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task', details: error.message });
  }
};

export const assignFreelancer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== TaskStatus.OPEN) {
      return res.status(400).json({ error: 'Task is not open for assignment' });
    }

    if (task.clientId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the client can assign freelancers' });
    }

    const freelancer = await User.findByPk(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    task.freelancerId = freelancerId;
    task.status = TaskStatus.ASSIGNED;
    await task.save();

    console.log(`🤝 Freelancer ${freelancerId} assigned to task ${id}`);

    res.json({
      success: true,
      message: 'Freelancer assigned successfully',
      task: {
        id: task.id,
        status: task.status,
        freelancerId: task.freelancerId,
      },
    });
  } catch (error: any) {
    console.error('Assign freelancer error:', error);
    res.status(500).json({ error: 'Failed to assign freelancer', details: error.message });
  }
};

export const CreateTaskSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20),
  budget: z.number().positive().min(1),
});

export const AssignFreelancerSchema = z.object({
  freelancerId: z.string().uuid(),
});
