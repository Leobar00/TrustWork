import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import sequelize, { testConnection, syncDatabase } from './config/database';
import './models';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import submissionRoutes from './routes/submissionRoutes';
import escrowRoutes from './routes/escrowRoutes';
import disputeRoutes from './routes/disputeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/disputes', disputeRoutes);

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    console.log('🚀 Starting TrustWork Backend...\n');

    await testConnection();

    await syncDatabase(false);

    app.listen(PORT, () => {
      console.log('\n✅ Server is running!');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('\n📡 API Endpoints:');
      console.log('   GET  /health');
      console.log('   POST /api/users/connect');
      console.log('   GET  /api/users/me');
      console.log('   GET  /api/users/balance');
      console.log('   POST /api/tasks');
      console.log('   GET  /api/tasks');
      console.log('   POST /api/submissions');
      console.log('   POST /api/submissions/:id/validate');
      console.log('   POST /api/escrow/lock');
      console.log('   POST /api/escrow/release');
      console.log('   POST /api/disputes');
      console.log('   POST /api/disputes/:id/resolve');
      console.log('\n🎯 Ready to accept connections!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
