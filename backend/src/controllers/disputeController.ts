import { Response } from 'express';
import { z } from 'zod';
import { Dispute, Task, Submission, Escrow, User } from '../models';
import { DisputeStatus, DisputeOutcome } from '../models/Dispute';
import { TaskStatus } from '../models/Task';
import aiService from '../services/aiService';
import walletService from '../services/walletService';
import { AuthRequest } from '../middleware/auth';

const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

export const raiseDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, reason } = req.body;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.clientId !== req.user!.id && task.freelancerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only task participants can raise disputes' });
    }

    if (task.status !== TaskStatus.SUBMITTED && task.status !== TaskStatus.IN_REVIEW) {
      return res.status(400).json({ error: 'Task must be submitted or in review to raise a dispute' });
    }

    const existingDispute = await Dispute.findOne({
      where: { taskId, status: DisputeStatus.OPEN },
    });

    if (existingDispute) {
      return res.status(400).json({ error: 'An open dispute already exists for this task' });
    }

    const dispute = await Dispute.create({
      taskId,
      raisedBy: req.user!.id,
      reason,
      status: DisputeStatus.OPEN,
    });

    task.status = TaskStatus.DISPUTED;
    await task.save();

    console.log(`⚠️  Dispute raised for task ${taskId} by user ${req.user!.id}`);

    res.status(201).json({
      success: true,
      message: 'Dispute raised successfully. AI will analyze and resolve.',
      dispute: {
        id: dispute.id,
        taskId: dispute.taskId,
        raisedBy: dispute.raisedBy,
        status: dispute.status,
        createdAt: dispute.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Raise dispute error:', error);
    res.status(500).json({ error: 'Failed to raise dispute', details: error.message });
  }
};

export const respondToDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const dispute = await Dispute.findByPk(id, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const task = dispute.task as any;

    if (task.freelancerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the freelancer can respond to this dispute' });
    }

    if (dispute.status !== DisputeStatus.OPEN) {
      return res.status(400).json({ error: 'Dispute is not open for responses' });
    }

    dispute.freelancerResponse = response;
    await dispute.save();

    console.log(`💬 Freelancer responded to dispute ${id}`);

    res.json({
      success: true,
      message: 'Response recorded successfully',
      dispute: {
        id: dispute.id,
        freelancerResponse: dispute.freelancerResponse,
      },
    });
  } catch (error: any) {
    console.error('Respond to dispute error:', error);
    res.status(500).json({ error: 'Failed to respond to dispute', details: error.message });
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dispute = await Dispute.findByPk(id, {
      include: [
        {
          model: Task,
          as: 'task',
          include: [
            { model: User, as: 'client' },
            { model: User, as: 'freelancer' },
          ],
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    const task = dispute.task as any;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const submission = await Submission.findOne({
      where: { taskId: task.id },
      order: [['createdAt', 'DESC']],
    });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found for this task' });
    }

    dispute.status = DisputeStatus.ANALYZING;
    await dispute.save();

    console.log(`🤖 Starting AI dispute resolution for dispute ${id}...`);

    console.log('   Stage 1: Collecting evidence...');
    const evidence = await aiService.collectDisputeEvidence(task.description, submission.content, dispute.reason, dispute.freelancerResponse);

    console.log('   Stage 2: Assessing each party...');
    const assessment = await aiService.assessEachParty(evidence);

    console.log('   Stage 3: Re-validating submission...');
    const revalidation = await aiService.revalidateSubmission(submission.content, task.description, {
      evidence,
      assessment,
      originalScore: submission.finalScore,
    });

    console.log('   Stage 4: Making final decision...');
    const decision = await aiService.makeDisputeDecision(
      submission.finalScore || 70,
      assessment.clientClaimScore,
      assessment.freelancerDefenseScore,
      revalidation.revalidationScore,
      evidence
    );

    dispute.clientClaimScore = assessment.clientClaimScore;
    dispute.freelancerDefenseScore = assessment.freelancerDefenseScore;
    dispute.revalidationScore = revalidation.revalidationScore;
    dispute.aiAnalysis = {
      evidence,
      assessment,
      revalidation,
      decision,
    };
    dispute.outcome = decision.outcome as DisputeOutcome;
    dispute.resolution = decision.resolution;
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = new Date();
    await dispute.save();

    console.log(`   Stage 5: Executing on-chain resolution...`);

    const escrow = await Escrow.findOne({ where: { taskId: task.id } });
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    const client = task.client as any;
    const freelancer = task.freelancer as any;

    let blockchainResult;

    if (decision.freelancerPercent === 100) {
      blockchainResult = await walletService.releasePayment(task.id, freelancer.walletAddress, parseFloat(escrow.amount.toString()), PLATFORM_PRIVATE_KEY);
    } else if (decision.freelancerPercent === 0) {
      blockchainResult = await walletService.refundPayment(task.id, client.walletAddress, parseFloat(escrow.amount.toString()), PLATFORM_PRIVATE_KEY);
    } else {
      blockchainResult = await walletService.partialRelease(
        task.id,
        freelancer.walletAddress,
        client.walletAddress,
        decision.freelancerPercent,
        parseFloat(escrow.amount.toString()),
        PLATFORM_PRIVATE_KEY
      );
      escrow.status = 'partial' as any;
    }

    if (blockchainResult.status === 'success') {
      if (decision.freelancerPercent === 100) {
        escrow.releaseTxHash = blockchainResult.txHash;
        escrow.releasedAt = new Date();
      } else if (decision.freelancerPercent === 0) {
        escrow.refundTxHash = blockchainResult.txHash;
        escrow.refundedAt = new Date();
      }

      await escrow.save();

      task.status = TaskStatus.COMPLETED;
      await task.save();

      console.log(`✅ Dispute resolved and executed on-chain! TxHash: ${blockchainResult.txHash}`);

      res.json({
        success: true,
        message: 'Dispute resolved and payment executed on-chain',
        dispute: {
          id: dispute.id,
          outcome: dispute.outcome,
          resolution: dispute.resolution,
          freelancerPercent: decision.freelancerPercent,
          reasoning: decision.reasoning,
          txHash: blockchainResult.txHash,
        },
      });
    } else {
      res.status(500).json({
        error: 'Dispute resolved but blockchain execution failed',
        dispute: {
          id: dispute.id,
          outcome: dispute.outcome,
          resolution: dispute.resolution,
        },
      });
    }
  } catch (error: any) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({ error: 'Failed to resolve dispute', details: error.message });
  }
};

export const getDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dispute = await Dispute.findByPk(id, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    res.json({
      success: true,
      dispute,
    });
  } catch (error: any) {
    console.error('Get dispute error:', error);
    res.status(500).json({ error: 'Failed to get dispute', details: error.message });
  }
};

export const RaiseDisputeSchema = z.object({
  taskId: z.string().uuid(),
  reason: z.string().min(50),
});

export const RespondToDisputeSchema = z.object({
  response: z.string().min(50),
});
