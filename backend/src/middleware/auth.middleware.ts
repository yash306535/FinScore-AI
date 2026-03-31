import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AuthTokenPayload } from '../types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined) ?? (req.cookies?.token as string | undefined);

  if (!token) {
    res.status(401).json({ message: 'authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as AuthTokenPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'invalid or expired token' });
  }
};
