import nodemailer from 'nodemailer';
import { env } from './env';

// 初始化邮箱发送客户端，用于发送OTP验证码
export const emailTransporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: true, // 465端口必须用true
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// 启动时验证邮箱服务是否可用
emailTransporter.verify().then(() => {
  console.log('📧 邮箱服务连接成功');
}).catch((err) => {
  console.error('❌ 邮箱服务连接失败，请检查配置：', err);
});