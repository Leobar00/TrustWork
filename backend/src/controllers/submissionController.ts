import { Response } from 'express';
import { z } from 'zod';
import { Submission, Task } from '../models';
import { SubmissionStatus } from '../models/Submission';
import { TaskStatus } from '../models/Task';
import aiService from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

export const submitWork = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, content, attachmentUrls } = req.body;

    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.freelancerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the assigned freelancer can submit work' });
    }

    if (task.status !== TaskStatus.ASSIGNED) {
      return res.status(400).json({ error: 'Task is not in a state to accept submissions' });
    }

    const submission = await Submission.create({
      taskId,
      freelancerId: req.user!.id,
      content,
      attachmentUrls: attachmentUrls || [],
      status: SubmissionStatus.PENDING,
    });

    task.status = TaskStatus.SUBMITTED;
    await task.save();

    console.log(`📤 Work submitted for task ${taskId} by ${req.user!.id}`);

    res.status(201).json({
      success: true,
      message: 'Work submitted successfully. AI validation will begin shortly.',
      submission: {
        id: submission.id,
        taskId: submission.taskId,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Submit work error:', error);
    res.status(500).json({ error: 'Failed to submit work', details: error.message });
  }
};

export const validateSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const task = submission.task as any;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    submission.status = SubmissionStatus.VALIDATING;
    await submission.save();

    console.log(`🤖 Starting AI validation for submission ${id}...`);

    const stage1 = await aiService.validateWorkQuality(submission.content);
    console.log(`   Stage 1 - Quality: ${stage1.score}/100`);

    if (!stage1.passed) {
      submission.status = SubmissionStatus.REJECTED;
      submission.qualityScore = stage1.score;
      submission.feedback = `Quality check failed: ${stage1.feedback}`;
      await submission.save();

      return res.json({
        success: false,
        message: 'Submission rejected at quality check stage',
        validation: {
          stage: 1,
          qualityScore: stage1.score,
          feedback: stage1.feedback,
        },
      });
    }

    const stage2 = await aiService.validateRequirements(submission.content, task.description, task.title);
    console.log(`   Stage 2 - Requirements: ${stage2.score}/100`);

    const stage3 = await aiService.validateContent(submission.content);
    console.log(`   Stage 3 - Content: ${stage3.score}/100`);

    const finalDecision = await aiService.makeFinalDecision(stage1.score, stage2.score, stage3.score, task.title);

    submission.qualityScore = stage1.score;
    submission.requirementScore = stage2.score;
    submission.contentScore = stage3.score;
    submission.finalScore = finalDecision.finalScore;
    submission.feedback = finalDecision.feedback;
    submission.aiValidationResult = {
      stage1,
      stage2,
      stage3,
      finalDecision,
    };

    if (finalDecision.decision === 'auto_approve') {
      submission.status = SubmissionStatus.APPROVED;
      task.status = TaskStatus.IN_REVIEW;
    } else if (finalDecision.decision === 'pending_review') {
      submission.status = SubmissionStatus.UNDER_REVIEW;
      task.status = TaskStatus.IN_REVIEW;
    } else {
      submission.status = SubmissionStatus.REJECTED;
    }

    await submission.save();
    await task.save();

    res.json({
      success: true,
      validation: {
        qualityScore: stage1.score,
        requirementScore: stage2.score,
        contentScore: stage3.score,
        finalScore: finalDecision.finalScore,
        decision: finalDecision.decision,
        feedback: finalDecision.feedback,
        breakdown: finalDecision.breakdown,
      },
      submission: {
        id: submission.id,
        status: submission.status,
      },
    });
  } catch (error: any) {
    console.error('Validate submission error:', error);
    res.status(500).json({ error: 'Failed to validate submission', details: error.message });
  }
};

export const getSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findByPk(id, {
      include: [{ model: Task, as: 'task' }],
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      success: true,
      submission,
    });
  } catch (error: any) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to get submission', details: error.message });
  }
};

export const SubmitWorkSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(50),
  attachmentUrls: z.array(z.string().url()).optional(),
});
