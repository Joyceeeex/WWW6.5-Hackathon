import OpenAI from 'openai';
import { env } from './env';

// 初始化OpenAI客户端，整个项目共用这一个实例
export const openaiClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});