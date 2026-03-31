import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

import { getAuthCookieClearOptions, getAuthCookieOptions } from '../config/runtime';
import { createAppError } from '../types';

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  name: true,
  email: true,
  age: true,
  income: true,
  createdAt: true
} satisfies Prisma.UserSelect;

const signToken = (userId: string, email: string): string =>
  jwt.sign({ userId, email }, process.env.JWT_SECRET || '', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
  });

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, age, income } = req.body as {
      name: string;
      email: string;
      password: string;
      age?: number;
      income?: number;
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        age,
        income
      },
      select: userSelect
    });

    const token = signToken(user.id, user.email);
    console.log('[register] token generated:', token ? `${token.slice(0, 20)}...` : 'UNDEFINED');

    res.cookie('token', token, getAuthCookieOptions());
    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      next(createAppError('email already registered', 409));
      return;
    }

    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      next(createAppError('invalid email or password', 401));
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      next(createAppError('invalid email or password', 401));
      return;
    }

    const token = signToken(user.id, user.email);
    console.log('[login] token generated:', token ? `${token.slice(0, 20)}...` : 'UNDEFINED');

    res.cookie('token', token, getAuthCookieOptions());
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        income: user.income,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', getAuthCookieClearOptions());
  res.json({ message: 'logged out successfully' });
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: userSelect
    });

    if (!user) {
      next(createAppError('user not found', 404));
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
