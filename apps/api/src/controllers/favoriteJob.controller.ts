import prisma from '../prisma';
import { Request, Response } from 'express';

export class FavoriteJobController {
  async getFavoriteJobs(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }

      const favorites = await prisma.favorite.findMany({
        where: { user_id: userId },
        include: {
          job: {
            include: { company: true },
          },
        },
      });

      res.status(200).json({
        status: 'ok',
        favorites,
      });
    } catch (error) {
      console.error('Failed to fetch favorite jobs:', error);
      res.status(500).json({ msg: 'An error occurred while fetching favorite jobs' });
    }
  }

  async checkApplicationStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.query;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }

      // --- FIX: Validate the jobId as a 24-character ObjectID string ---
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (typeof jobId !== 'string' || !objectIdRegex.test(jobId)) {
        return res.status(400).json({ msg: 'Invalid Job ID format' });
      }
      // --- END FIX ---

      const existingApplication = await prisma.application.findFirst({
        where: { 
          user_id: userId, 
          job_id: jobId // Use the validated string directly
        },
      });

      res.status(200).json({ applied: !!existingApplication });
      
    } catch (error) {
      console.error('Failed to check application status:', error);
      res.status(500).json({ msg: 'An error occurred while checking application status' });
    }
  }
}