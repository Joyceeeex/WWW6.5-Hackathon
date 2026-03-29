import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { env } from './env';

// 初始化区块链客户端，用于读取合约数据、验证SBT持有情况
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(env.RPC_URL),
});

// 合约地址导出，所有文件都从这里拿
export const CONTRACT_ADDRESS = env.CONTRACT_ADDRESS as `0x${string}`;