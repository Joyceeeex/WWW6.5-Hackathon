import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import aiRouter from './ai.routes';
import ipfsRouter from './ipfs.routes';
import contractRouter from './contract.routes';
import reputationRouter from './reputation.routes';

const rootRouter = Router();

// 挂载所有模块的路由
rootRouter.use('/health', healthRouter);
rootRouter.use('/auth', authRouter);
rootRouter.use('/ai', aiRouter);
rootRouter.use('/ipfs', ipfsRouter);
rootRouter.use('/contract', contractRouter);
rootRouter.use('/reputation', reputationRouter);

export default rootRouter;