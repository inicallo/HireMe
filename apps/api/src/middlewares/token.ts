import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_JWT } from '../config';

// type IUser = {
//   user_id: string;
//   role: string;
//   company_id?: string;
// };

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) throw new Error('Token is missing');

    const verifiedToken = verify(token, SECRET_JWT);

    req.user = verifiedToken as Express.Request['user'];

    next();
  } catch (err) {
    res.status(400).send({
      status: 'error',
      msg: 'Invalid or expired token',
    });
  }
};
