import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.util';

// 所有接口的报错都会被这里捕获，统一返回格式，不会让服务直接崩掉
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ 接口报错：', err);
  res.status(500).json(errorResponse('服务器内部错误，请稍后重试', 'SERVER_ERROR'));
};