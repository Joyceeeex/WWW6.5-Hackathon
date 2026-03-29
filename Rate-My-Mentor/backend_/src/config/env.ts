import dotenv from 'dotenv';
import { z } from 'zod';

// 加载.env文件
dotenv.config();

// 环境变量校验规则，确保必填项不缺失
const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API Key 必填'),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  PINATA_API_KEY: z.string().min(1, 'Pinata API Key 必填'),
  PINATA_API_SECRET: z.string().min(1, 'Pinata API Secret 必填'),
  EMAIL_HOST: z.string().min(1, '邮箱SMTP地址 必填'),
  EMAIL_PORT: z.string().default('465'),
  EMAIL_USER: z.string().min(1, '发件邮箱 必填'),
  EMAIL_PASS: z.string().min(1, '邮箱授权码 必填'),
  OTP_EXPIRE_MINUTES: z.string().default('10'),
  CONTRACT_ADDRESS: z.string().min(1, '合约地址 必填'),
  CONTRACT_ABI: z.string().default('[]'),
  RPC_URL: z.string().min(1, '区块链RPC地址 必填'),
  CHAIN_ID: z.string().default('11155111'),
  ENCRYPTION_KEY: z.string().length(32, '加密密钥必须为32位字符串'),
});

// 校验并导出环境变量
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ 环境变量校验失败，请检查.env文件：', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;