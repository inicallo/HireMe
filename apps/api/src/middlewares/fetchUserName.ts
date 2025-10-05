import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const fetchUserName = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user.user_id) {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.user_id },
      select: { first_name: true, last_name: true },
    });

    if (user) {
      (req.user as any).first_name = user.first_name; 
      (req.user as any).last_name = user.last_name;
    }

    next();
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ msg: 'Failed to process user data for file upload.' });
  }
};