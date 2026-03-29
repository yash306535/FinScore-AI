import { NextFunction, Request, Response } from 'express';

import { AppError } from '../types';

export const errorMiddleware = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'internal server error',
    statusCode,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
};
