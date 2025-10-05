import prisma from '../prisma';
import { Request, Response } from 'express';
import {
  CountryCode,
  JobCategory,
  JobEducationLevel,
  JobExperience,
  JobType,
  Prisma,
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class JobController {
  async createJob(req: Request, res: Response) {
    try {
      const {
        job_title, description, location, country, salary, jobType, jobCategory,
        jobEducationLevel, jobExperience, responsibility, jobExpired_at, companyId, is_active,
      } = req.body;

      const userId = req.user?.user_id;

      if (!job_title || !description || !companyId || !userId) {
        return res.status(400).json({ msg: 'Job title, description, company ID, and user ID are required' });
      }
      
      const jobData: Prisma.JobCreateInput = {
        job_title,
        description,
        location,
        country,
        jobType,
        jobCategory,
        jobExperience,
        jobEducationLevel,
        responsibility,
        jobExpired_at: jobExpired_at ? new Date(jobExpired_at) : null,
        salary: salary ? parseFloat(salary) : null,
        is_active: Boolean(is_active),
        company: { connect: { company_id: companyId } },
        user: { connect: { user_id: userId } },
      };

      const job = await prisma.job.create({ data: jobData });
      res.status(201).json({ job });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ msg: 'An error occurred while creating the job.' });
    }
  }

  async getJobs(req: Request, res: Response) {
    try {
      const {
        search, jobType, salary, jobCategory, jobEducationLevel,
        jobExperience, country, location, dateRange,
      } = req.query;

      const filters: Prisma.JobWhereInput[] = [{ is_active: true }];

      if (typeof search === 'string' && search) {
        filters.push({
          OR: [
            { job_title: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { company: { company_name: { contains: search, mode: 'insensitive' } } },
          ],
        });
      }
      if (country) filters.push({ country: country as CountryCode });
      if (location) filters.push({ location: { contains: location as string, mode: 'insensitive' } });

      const createInFilter = (field: keyof Prisma.JobWhereInput, values: any) => {
        const arr = Array.isArray(values) ? values : [values];
        if (arr.length > 0) {
          filters.push({ [field]: { in: arr } });
        }
      };
      
      if (jobType) createInFilter('jobType', jobType as JobType[]);
      if (jobCategory) createInFilter('jobCategory', jobCategory as JobCategory[]);
      if (jobEducationLevel) createInFilter('jobEducationLevel', jobEducationLevel as JobEducationLevel[]);
      if (jobExperience) createInFilter('jobExperience', jobExperience as JobExperience[]);

      if (salary) {
        const salaryRanges = Array.isArray(salary) ? salary : [salary];
        const salaryFilters = salaryRanges.map(range => {
          if (typeof range === 'string') {
            if (range.includes('-')) {
              const [min, max] = range.split('-').map(Number);
              return { salary: { gte: min, lte: max } };
            }
            return { salary: { gte: Number(range) } };
          }
          return {};
        });
        if (salaryFilters.length > 0) {
            filters.push({ OR: salaryFilters });
        }
      }

      const orderBy: Prisma.JobOrderByWithRelationInput = {
        created_at: dateRange === 'latest' ? 'desc' : 'asc',
      };

      const jobs = await prisma.job.findMany({
        where: { AND: filters },
        include: { company: true },
        orderBy,
      });

      res.status(200).json({ status: 'ok', jobs });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch jobs' });
    }
  }

  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await prisma.job.findUnique({
        where: { job_id: id },
        include: {
          company: {
            include: {
              jobs: { where: { job_id: { not: id } } },
            },
          },
        },
      });

      if (!job) return res.status(404).json({ msg: 'Job not found' });
      res.status(200).json({ job });
    } catch (error) {
      console.error(`Error fetching job ${req.params.id}:`, error);
      res.status(500).json({ msg: 'An error occurred while fetching the job.' });
    }
  }
  
  async updateJob(req: Request, res: Response) {
    try {
      const jobId = req.params.id;
      const data = req.body;

      const updateData: Prisma.JobUpdateInput = {};
      
      if (data.job_title) updateData.job_title = data.job_title;
      if (data.description) updateData.description = data.description;
      if (data.responsibility) updateData.responsibility = data.responsibility;
      if (data.location) updateData.location = data.location;
      if (data.country) updateData.country = data.country;
      if (data.jobCategory) updateData.jobCategory = data.jobCategory;
      if (data.jobEducationLevel) updateData.jobEducationLevel = data.jobEducationLevel;
      if (data.salary !== undefined) updateData.salary = parseFloat(data.salary);
      if (data.jobExpired_at) updateData.jobExpired_at = new Date(data.jobExpired_at);
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      // CRITICAL: Prevent the enum error for jobExperience
      if (data.jobExperience) { // Only update if it's a non-empty string
        updateData.jobExperience = data.jobExperience;
      }

      const updatedJob = await prisma.job.update({
        where: { job_id: jobId },
        data: updateData,
      });

      res.status(200).json({ status: 'ok', msg: 'Job updated successfully!', job: updatedJob });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ status: 'error', msg: 'Job not found' });
      }
      console.error(`Error updating job ${req.params.id}:`, error);
      res.status(400).json({ status: 'error', msg: 'An error occurred while updating the job.' });
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      const jobId = req.params.id;
      await prisma.job.delete({ where: { job_id: jobId } });
      res.status(200).json({ status: 'ok', msg: 'Job deleted successfully' });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ status: 'error', msg: 'Job not found' });
      }
      console.error(`Error deleting job ${req.params.id}:`, error);
      res.status(500).json({ status: 'error', msg: 'Failed to delete job' });
    }
  }

  async getJobsByCompanyId(req: Request, res: Response) {
    try {
      const { companyId } = req.params; 

      const jobs = await prisma.job.findMany({
        where: { company_id: companyId, is_active: true },
        include: { company: true },
      });

      res.status(200).json({ status: 'ok', jobs });
    } catch (error) {
      console.error(`Error fetching jobs for company ${req.params.companyId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch jobs by company ID' });
    }
  }

  async getAppliedJobCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

      const count = await prisma.application.count({ where: { user_id: userId } });
      res.status(200).json({ count });
    } catch (error) {
      console.error(`Error fetching applied job count for user ${req.user?.user_id}:`, error);
      res.status(500).json({ msg: 'Failed to fetch applied job count' });
    }
  }

  async getFavoriteJobCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

      const count = await prisma.favorite.count({ where: { user_id: userId } });
      res.status(200).json({ count });
    } catch (error) {
      console.error(`Error fetching favorite job count for user ${req.user?.user_id}:`, error);
      res.status(500).json({ msg: 'Failed to fetch favorite job count' });
    }
  }

  async toggleSaveJob(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { jobId } = req.body;

      if (!userId || !jobId) return res.status(400).json({ msg: 'User ID and Job ID are required' });

      const existingFavorite = await prisma.favorite.findUnique({
        where: { user_id_job_id: { user_id: userId, job_id: jobId } },
      });
      
      if (existingFavorite) {
        await prisma.favorite.delete({
          where: { user_id_job_id: { user_id: userId, job_id: jobId } },
        });
        res.status(200).json({ msg: 'Job removed from favorites' });
      } else {
        await prisma.favorite.create({
          data: {
            user_id: userId,
            job_id: jobId,
          },
        });
        res.status(200).json({ msg: 'Job saved to favorites' });
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
      res.status(500).json({ msg: 'Failed to save job' });
    }
  }

  async getFavoriteJobs(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

      const favorites = await prisma.favorite.findMany({
        where: { user_id: userId },
        include: {
          job: { include: { company: true } },
        },
      });
      res.status(200).json({ status: 'ok', favorites });
    } catch (error) {
      console.error(`Error fetching favorite jobs for user ${req.user?.user_id}:`, error);
      res.status(500).json({ msg: 'Failed to fetch favorite jobs' });
    }
  }

  async getRecentlyPostedJobs(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!userId) return res.status(400).json({ msg: 'Invalid User ID' });

      const jobs = await prisma.job.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: { company: true },
      });

      res.status(200).json({ jobs });
    } catch (error) {
      console.error(`Error fetching recent jobs for user ${req.params.userId}:`, error);
      res.status(500).json({ msg: 'Failed to fetch recently posted jobs' });
    }
  }

  async getTotalJobsCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

      const totalJobsCount = await prisma.job.count({ where: { user_id: userId } });
      res.status(200).json({ totalJobsCount });
    } catch (error) {
      console.error(`Error fetching total jobs count for user ${req.user?.user_id}:`, error);
      res.status(500).json({ msg: 'Failed to fetch total jobs count' });
    }
  }
  
  async getTotalApplicantsCount(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      if (!userId) return res.status(401).json({ msg: 'Unauthorized' });

      const count = await prisma.application.count({
        where: {
          job: {
            user_id: userId,
          },
        },
      });

      res.status(200).json({ count });
    } catch (error) {
      console.error(`Error fetching total applicants for user ${req.user?.user_id}:`, error);
      res.status(500).json({ msg: 'Failed to fetch total applicants count' });
    }
  }
}