import { Request, Response } from 'express';
import prisma from '../prisma';

export class AnalyticsController {
  async getApplicantInterests(req: Request, res: Response) {
    try {
      const jobCategories = await prisma.job.groupBy({
        by: ['jobCategory'],
        _count: { jobCategory: true },
      });

      const locations = await prisma.job.groupBy({
        by: ['location'],
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 5,
      });

      res.status(200).json({
        jobCategories,
        locations,
      });
    } catch (error) {
      console.error('Error fetching applicant interests:', error);
      res.status(500).json({ msg: 'Failed to fetch applicant interests' });
    }
  }

  async getOtherImportantData(req: Request, res: Response) {
    try {
      const completedApplications = await prisma.application.count({
        where: { status: 'accepted' },
      });
      const totalApplications = await prisma.application.count();
      const jobApplicationCompletion = totalApplications
        ? (completedApplications / totalApplications) * 100
        : 0;

      const applicationStatusDistribution = await prisma.application.groupBy({
        by: ['status'],
        _count: { status: true },
        orderBy: { _count: { status: 'desc' } },
      });

      res.status(200).json({
        jobApplicationCompletion,
        applicationStatusDistribution,
      });
    } catch (error) {
      console.error('Error fetching other important data:', error);
      res.status(500).json({ msg: 'Failed to fetch other important data' });
    }
  }

  async getSalaryTrends(req: Request, res: Response) {
    try {
      const salaryByLocation = await prisma.job.groupBy({
        by: ['location'],
        _avg: { salary: true },
        orderBy: { _avg: { salary: 'desc' } },
        take: 5,
      });

      const popularPositions = await prisma.job.groupBy({
        by: ['job_title'],
        _avg: { salary: true },
        orderBy: { _avg: { salary: 'desc' } },
        take: 5,
      });

      res.status(200).json({
        salaryByLocation,
        popularPositions,
      });
    } catch (error) {
      console.error('Error fetching salary trends:', error);
      res.status(500).json({ msg: 'Failed to fetch salary trends' });
    }
  }

  async getUserDemographics(req: Request, res: Response) {
    try {
      const averageExperience = await prisma.user.aggregate({
        _avg: { years_of_experience: true },
      });
  
      const genderDistribution = await prisma.user.groupBy({
        by: ['gender'],
        _count: { gender: true },
      });
  
      const topCountries = await prisma.user.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 5,
      });
  
      res.status(200).json({
        averageExperience: averageExperience._avg?.years_of_experience || 0,
        genderDistribution,
        topCountries,
      });
    } catch (error) {
      console.error('Error fetching user demographics:', error);
      res.status(500).json({ msg: 'Failed to fetch user demographics' });
    }
  }
  
}
