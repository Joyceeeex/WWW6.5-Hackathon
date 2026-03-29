import CryptoJS from 'crypto-js';
import { env } from '../config/env';

// 加密评价内容，加密后再上传到IPFS，保证隐私
export function encryptContent(content: string): string {
  return CryptoJS.AES.encrypt(content, env.ENCRYPTION_KEY).toString();
}

// 解密评价内容，只有验证用户持有SBT后才解密返回
export function decryptContent(encryptedContent: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}