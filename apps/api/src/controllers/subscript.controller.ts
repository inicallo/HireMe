import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class DashboardController {
  async getDashboardData(req: Request, res: Response) {
    try {
      // Fetch total subscribed users
      const totalUsers = await prisma.subscription.count({
        where: { NOT: { status: null } },
      });

      // Fetch completed transactions
      const completedTransactions = await prisma.paymentTransaction.count({
        where: { status: 'completed' },
      });

      // Calculate total revenue
      const totalRevenue = await prisma.paymentTransaction.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      });

      // Fetch active subscriptions
      const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      // Fetch inactive subscriptions
      const inactiveSubscriptions = await prisma.subscription.findMany({
        where: { status: 'inactive' },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      // Format data for response
      res.json({
        totalUsers,
        completedTransactions,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSubscriptions: activeSubscriptions.map((sub) => ({
          subscription_id: sub.subscription_id,
          user_id: sub.user_id,
          user_name: `${sub.user?.first_name} ${sub.user?.last_name}`,
          start_date: sub.start_date?.toISOString().split('T')[0],
          end_date: sub.end_date?.toISOString().split('T')[0],
        })),
        inactiveSubscriptions: inactiveSubscriptions.map((sub) => ({
          subscription_id: sub.subscription_id,
          user_id: sub.user_id,
          user_name: `${sub.user?.first_name} ${sub.user?.last_name}`,
          start_date: sub.start_date?.toISOString().split('T')[0],
          end_date: sub.end_date?.toISOString().split('T')[0],
        })),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async checkActiveSubscription(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      // Ensure user authentication middleware has added user_id to req.user
      const userId = req.user?.user_id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Find an active subscription with a valid end_date
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          user_id: userId,
          status: 'active',
          end_date: {
            gte: new Date(), // Ensure the subscription is still valid
          },
        },
      });

      if (activeSubscription) {
        res.status(200).json({ isActive: true });
      } else {
        res.status(403).json({
          isActive: false,
          message: 'You do not have an active subscription.',
        });
      }
    } catch (error) {
      console.error('Error checking active subscription:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
