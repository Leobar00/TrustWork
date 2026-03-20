import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models';
import { UserRole } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import walletService from '../services/walletService';

export const connectWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { walletAddress, role } = req.body;

    let user = await User.findOne({ where: { walletAddress } });

    if (!user) {
      user = await User.create({
        walletAddress,
        role: role || UserRole.BOTH,
        reputationScore: 50.0,
        completedTasks: 0,
      });

      console.log(`✅ New user registered: ${walletAddress}`);
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        reputationScore: user.reputationScore,
        completedTasks: user.completedTasks,
      },
    });
  } catch (error: any) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ error: 'Failed to connect wallet', details: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      role: user.role,
      reputationScore: user.reputationScore,
      completedTasks: user.completedTasks,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
};

export const getWalletBalance = async (req: AuthRequest, res: Response) => {
  try {
    const balance = await walletService.getBalance(req.user!.walletAddress);

    res.json({
      walletAddress: req.user!.walletAddress,
      balance: balance,
      currency: 'USDT',
    });
  } catch (error: any) {
    console.error('Get balance error:', error);
    res.status(500).json({ error: 'Failed to get balance', details: error.message });
  }
};

export const ConnectWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  role: z.enum(['client', 'freelancer', 'both']).optional(),
});
