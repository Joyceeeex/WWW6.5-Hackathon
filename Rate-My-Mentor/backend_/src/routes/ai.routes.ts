import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';

const aiRouter = Router();

aiRouter.post('/extract-review', AIController.extractReview);
aiRouter.post('/ocr-offer', AIController.ocrOffer);

export default aiRouter;