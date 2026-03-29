import PinataSDK from '@pinata/sdk';
import { env } from './env';

// 初始化Pinata IPFS客户端，用于上传/读取评价内容
export const pinataClient = new PinataSDK({
  pinataApiKey: env.PINATA_API_KEY,
  pinataSecretApiKey: env.PINATA_API_SECRET,
});