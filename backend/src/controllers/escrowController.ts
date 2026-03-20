import { Response } from 'express';
import { z } from 'zod';
import { Escrow, Task, User } from '../models';
import { EscrowStatus } from '../models/Escrow';
import { TaskStatus } from '../models/Task';
import walletService from '../services/walletService';
import { AuthRequest } from '../middleware/auth';

const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

export const lockFunds = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, clientPrivateKey } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.clientId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the client can lock funds' });
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      return res.status(400).json({ error: 'Task must be assigned before locking funds' });
    }

    const escrow = await Escrow.findOne({ where: { taskId } });
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      return res.status(400).json({ error: 'Funds already locked or processed' });
    }

    escrow.status = EscrowStatus.LOCKING;
    await escrow.save();

    console.log(`🔒 Locking ${escrow.amount} USDT on-chain for task ${taskId}...`);

    const result = await walletService.lockFunds(clientPrivateKey, parseFloat(escrow.amount.toString()), taskId);

    if (result.status === 'success') {
      escrow.status = EscrowStatus.LOCKED;
      escrow.contractAddress = result.contractAddress;
      escrow.lockTxHash = result.txHash;
      escrow.lockedAt = new Date();
      await escrow.save();

      console.log(`✅ Funds locked successfully! TxHash: ${result.txHash}`);

      res.json({
        success: true,
        message: 'Funds locked on-chain successfully',
        escrow: {
          id: escrow.id,
          status: escrow.status,
          amount: escrow.amount,
          contractAddress: escrow.contractAddress,
          txHash: result.txHash,
          lockedAt: escrow.lockedAt,
        },
      });
    } else {
      escrow.status = EscrowStatus.FAILED;
      await escrow.save();

      res.status(500).json({
        error: 'Failed to lock funds on blockchain',
        details: result,
      });
    }
  } catch (error: any) {
    console.error('Lock funds error:', error);
    res.status(500).json({ error: 'Failed to lock funds', details: error.message });
  }
};

export const releaseFunds = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;

    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: 'freelancer' }],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.clientId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the client can release funds' });
    }

    if (task.status !== TaskStatus.IN_REVIEW && task.status !== TaskStatus.SUBMITTED) {
      return res.status(400).json({ error: 'Task must be in review or submitted state' });
    }

    const escrow = await Escrow.findOne({ where: { taskId } });
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.status !== EscrowStatus.LOCKED) {
      return res.status(400).json({ error: 'Funds must be locked before release' });
    }

    const freelancer = task.freelancer as any;
    if (!freelancer) {
      return res.status(400).json({ error: 'No freelancer assigned' });
    }

    escrow.status = EscrowStatus.RELEASING;
    await escrow.save();

    console.log(`💸 Releasing ${escrow.amount} USDT to ${freelancer.walletAddress}...`);

    const result = await walletService.releasePayment(taskId, freelancer.walletAddress, parseFloat(escrow.amount.toString()), PLATFORM_PRIVATE_KEY);

    if (result.status === 'success') {
      escrow.status = EscrowStatus.RELEASED;
      escrow.releaseTxHash = result.txHash;
      escrow.releasedAt = new Date();
      await escrow.save();

      task.status = TaskStatus.COMPLETED;
      await task.save();

      freelancer.completedTasks += 1;
      await freelancer.save();

      console.log(`✅ Payment released successfully! TxHash: ${result.txHash}`);

      res.json({
        success: true,
        message: 'Payment released on-chain successfully',
        escrow: {
          id: escrow.id,
          status: escrow.status,
          amount: escrow.amount,
          txHash: result.txHash,
          releasedAt: escrow.releasedAt,
        },
      });
    } else {
      escrow.status = EscrowStatus.FAILED;
      await escrow.save();

      res.status(500).json({
        error: 'Failed to release payment on blockchain',
        details: result,
      });
    }
  } catch (error: any) {
    console.error('Release funds error:', error);
    res.status(500).json({ error: 'Failed to release funds', details: error.message });
  }
};

export const refundFunds = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.body;

    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: 'client' }],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const escrow = await Escrow.findOne({ where: { taskId } });
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.status !== EscrowStatus.LOCKED) {
      return res.status(400).json({ error: 'Funds must be locked before refund' });
    }

    const client = task.client as any;

    escrow.status = EscrowStatus.REFUNDING;
    await escrow.save();

    console.log(`↩️  Refunding ${escrow.amount} USDT to ${client.walletAddress}...`);

    const result = await walletService.refundPayment(taskId, client.walletAddress, parseFloat(escrow.amount.toString()), PLATFORM_PRIVATE_KEY);

    if (result.status === 'success') {
      escrow.status = EscrowStatus.REFUNDED;
      escrow.refundTxHash = result.txHash;
      escrow.refundedAt = new Date();
      await escrow.save();

      task.status = TaskStatus.CANCELLED;
      await task.save();

      console.log(`✅ Refund processed successfully! TxHash: ${result.txHash}`);

      res.json({
        success: true,
        message: 'Refund processed on-chain successfully',
        escrow: {
          id: escrow.id,
          status: escrow.status,
          amount: escrow.amount,
          txHash: result.txHash,
          refundedAt: escrow.refundedAt,
        },
      });
    } else {
      escrow.status = EscrowStatus.FAILED;
      await escrow.save();

      res.status(500).json({
        error: 'Failed to process refund on blockchain',
        details: result,
      });
    }
  } catch (error: any) {
    console.error('Refund funds error:', error);
    res.status(500).json({ error: 'Failed to refund funds', details: error.message });
  }
};

export const getEscrowStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const escrow = await Escrow.findOne({ where: { taskId } });

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json({
      success: true,
      escrow,
    });
  } catch (error: any) {
    console.error('Get escrow status error:', error);
    res.status(500).json({ error: 'Failed to get escrow status', details: error.message });
  }
};

export const LockFundsSchema = z.object({
  taskId: z.string().uuid(),
  clientPrivateKey: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid private key format'),
});

export const ReleaseFundsSchema = z.object({
  taskId: z.string().uuid(),
});

export const RefundFundsSchema = z.object({
  taskId: z.string().uuid(),
});
