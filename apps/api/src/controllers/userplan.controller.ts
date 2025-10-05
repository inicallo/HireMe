import prisma from '../prisma';
import { Request, Response } from 'express';


export class UserPlanController {
    async getUserSubscriptions(req: Request, res: Response) {
      try {
        const { user_id } = req.user!;

  
        if (!user_id) {
          return res.status(400).json({ status: 'error', msg: 'Invalid user ID' });
        }
  
        const subscriptions = await prisma.subscription.findMany({
          where: { user_id },
          include: { subscriptionType: true },
        });
  
        res.status(200).json({
          status: 'success',
          data: subscriptions,
        });
      } catch (error: any) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({
          status: 'error',
          msg: 'Failed to fetch subscriptions',
          error: error.message,
        });
      }
    }
  
    async getUserPayments(req: Request, res: Response) {
      try {
        const { user_id } = req.user!;
  
        if (!user_id) {
          return res.status(400).json({ status: 'error', msg: 'Invalid user ID' });
        }
  
        const payments = await prisma.paymentTransaction.findMany({
          where: { user_id },
        });
  
        res.status(200).json({
          status: 'success',
          data: payments,
        });
      } catch (error: any) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
          status: 'error',
          msg: 'Failed to fetch payments',
          error: error.message,
        });
      }
    }
  }
  