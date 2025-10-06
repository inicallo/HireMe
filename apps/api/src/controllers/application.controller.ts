import prisma from '../prisma';
import {
  notifyApplicationStatusChange,
  sendNotification,
} from '../services/notificationService';
import { Request, Response } from 'express';
import { ApplicationStatus, NotificationType } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { transporter } from '../helpers/notmailer';

export const base_url = process.env.BASE_API_URL;
export const base_fe_url = process.env.BASE_FE_URL;

export class ApplicationController {
  async createApplication(req: Request, res: Response) {
    try {
      const userId = req.user?.user_id;
      const { jobId, coverLetter, expected_salary, fileUrl } = req.body;

      if (!userId || !jobId) {
        return res.status(400).json({ msg: 'User ID and Job ID are required' });
      }

      const resumePath = fileUrl || null;

      const existingApplication = await prisma.application.findFirst({
        where: {
          user_id: userId,
          job_id: jobId,
        },
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ msg: 'You have already applied for this job.' });
      }

      const job = await prisma.job.findUnique({
        where: { job_id: jobId },
        include: { company: true },
      });
      const user = await prisma.user.findUnique({ where: { user_id: userId } });

      if (!job || !user) {
        return res.status(404).json({ msg: 'Job or user not found' });
      }

      const application = await prisma.application.create({
        data: {
          resume: resumePath,
          coverLetter,
          expected_salary: expected_salary ? parseFloat(expected_salary) : null,
          status: 'active',
          user: { connect: { user_id: userId } },
          job: { connect: { job_id: jobId } },
        },
      });

      await sendNotification({
        userId,
        subject: 'Application Submitted',
        message:
          'Thank you! Your application has been received and is now under review.',
        type: NotificationType.application,
        relatedId: application.application_id,
        link: `/applications/${application.application_id}`,
      });

      const templatePath = path.join(
        __dirname,
        '../templates/applicationConfirmation.hbs',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);

      const emailHtml = compiledTemplate({
        name: `${user.first_name} ${user.last_name}`,
        jobTitle: job.job_title,
        companyName: job.company?.company_name || 'the company',
        base_fe_url: base_fe_url,
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Your Job Application Submission',
        html: emailHtml,
      });

      res
        .status(201)
        .json({ msg: 'Application submitted successfully!', application });
    } catch (error) {
      const err = error as Error;
      res
        .status(500)
        .json({ msg: 'Error creating application', error: err.message });
    }
  }

  async getApplicationsByUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      if (!userId) return res.status(400).json({ msg: 'Invalid User ID' });

      const applications = await prisma.application.findMany({
        where: { user_id: userId },
        include: { job: true },
      });

      res.status(200).json({ applications });
    } catch (error) {
      res.status(500).json({ msg: 'Failed to fetch applications' });
    }
  }

  async getApplicationById(req: Request, res: Response) {
    try {
      const applicationId = req.params.applicationId;

      if (!applicationId)
        return res.status(400).json({ msg: 'Invalid application ID' });

      const application = await prisma.application.findUnique({
        where: { application_id: applicationId },
        include: { job: true },
      });

      if (!application)
        return res.status(404).json({ msg: 'Application not found' });

      res.status(200).json({ application });
    } catch (error) {
      res.status(500).json({ msg: 'Failed to fetch application' });
    }
  }

  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const { status: newStatus } = req.body;

      if (!applicationId || !newStatus) {
        return res
          .status(400)
          .json({ msg: 'Application ID and new status are required' });
      }

      if (
        !Object.values(ApplicationStatus).includes(
          newStatus as ApplicationStatus,
        )
      ) {
        return res.status(400).json({ msg: 'Invalid application status' });
      }

      const currentApplication = await prisma.application.findUnique({
        where: { application_id: applicationId },
        include: {
          job: {
            select: {
              company_id: true,
            },
          },
        },
      });

      if (!currentApplication) {
        return res.status(404).json({ msg: 'Application not found' });
      }

      const currentStatus = currentApplication.status;

      const updatedApplication = await prisma.application.update({
        where: { application_id: applicationId },
        data: { status: newStatus as ApplicationStatus },
      });

      if (newStatus === 'hired' && currentApplication.job?.company_id) {
        await prisma.company.update({
          where: {
            company_id: currentApplication.job.company_id,
          },
          data: {
            users: {
              connect: {
                user_id: updatedApplication.user_id,
              },
            },
          },
        });
      }

      await notifyApplicationStatusChange(
        updatedApplication.user_id,
        updatedApplication.application_id,
        currentStatus,
        newStatus,
      );

      res.status(200).json({
        msg: 'Application status updated successfully!',
        application: updatedApplication,
      });
    } catch (error) {
      const err = error as Error;
      res
        .status(500)
        .json({ msg: 'Error updating application status', error: err.message });
    }
  }

  async getRecentlyAppliedJobs(req: Request, res: Response) {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ msg: 'Invalid User ID' });
    }

    const applications = await prisma.application.findMany({
      where: { user_id: userId },
      orderBy: { applied_at: 'desc' },
      include: {
        job: { include: { company: true } },
      },
    });

    if (!applications) {
      return res.status(404).json({ msg: 'No applications found' });
    }
    res.status(200).json({
      applications: applications.map((app) => ({
        application_id: app.application_id,
        job_title: app.job?.job_title,
        company_name: app.job?.company?.company_name,
        logo: app.job?.company?.logo,
        location: app.job?.location,
        date_applied: app.applied_at,
        status: app.status,
      })),
    });
  }

  async getApplicationsByJobId(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!jobId || !objectIdRegex.test(jobId)) {
        return res.status(400).json({ msg: 'Invalid Job ID format' });
      }

      const test = await prisma.preSelectionTest.findUnique({
        where: { job_id: jobId },
        select: { test_id: true },
      });

      const applications = await prisma.application.findMany({
        where: { job_id: jobId },
        include: {
          user: true,
          job: {
            include: {
              company: true,
            },
          },
        },
      });

      if (applications.length === 0) {
        return res
          .status(404)
          .json({ msg: 'No applications found for this job' });
      }

      if (!test) {
        const formattedApps = applications.map((app) => ({
          id: app.application_id,
          name: `${app.user.first_name} ${app.user.last_name}`,
          position: app.job.job_title,
          logo: app.job.company?.logo,
          email: app.user.email,
          phone: app.user.phone,
          experience: app.user.years_of_experience,
          education: app.user.education,
          dateApplied: app.applied_at,
          resume: app.resume,
          status: app.status,
          photoUrl: app.user.profile_picture,
          user_id: app.user_id,
          correctAnswers: 0,
        }));
        return res.status(200).json({ applications: formattedApps });
      }

      const testId = test.test_id;

      const applicationsWithTestAnswers = await Promise.all(
        applications.map(async (app) => {
          const correctAnswersCount = await prisma.testAnswer.count({
            where: {
              user_id: app.user_id,
              test_id: testId,
              is_correct: true,
            },
          });

          return {
            id: app.application_id,
            name: `${app.user.first_name} ${app.user.last_name}`,
            position: app.job.job_title,
            logo: app.job.company?.logo,
            email: app.user.email,
            phone: app.user.phone,
            experience: app.user.years_of_experience,
            education: app.user.education,
            dateApplied: app.applied_at,
            resume: app.resume,
            status: app.status,
            photoUrl: app.user.profile_picture,
            user_id: app.user_id,
            correctAnswers: correctAnswersCount,
          };
        }),
      );

      res.status(200).json({
        applications: applicationsWithTestAnswers,
      });
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching applications by Job ID:', err);
      res
        .status(500)
        .json({ msg: 'Failed to fetch applications', error: err.message });
    }
  }

  async getInterviewApplicantsByCompany(req: Request, res: Response) {
    try {
      const companyId = req.params.companyId;

      if (!companyId) {
        return res.status(400).json({ msg: 'Invalid Company ID' });
      }

      const interviewApplicants = await prisma.application.findMany({
        where: {
          job: {
            company_id: companyId,
          },
          status: 'interview',
        },
        include: {
          user: true,
          job: true,
        },
      });

      if (interviewApplicants.length === 0) {
        return res
          .status(404)
          .json({ msg: 'No interview applicants found for this company' });
      }

      res.status(200).json({
        applicants: interviewApplicants.map((app) => ({
          id: app.application_id,
          name: `${app.user.first_name} ${app.user.last_name}`,
          position: app.job.job_title,
          experience: app.user.years_of_experience,
          education: app.user.education,
          photoUrl: app.user.profile_picture,
        })),
      });
    } catch (error) {
      res
        .status(500)
        .json({ msg: 'Failed to fetch interview applicants by company' });
    }
  }

  async updateInterviewSchedule(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const { interviewDate, interviewTime } = req.body;

      if (!applicationId || !interviewDate || !interviewTime) {
        return res.status(400).json({
          msg: 'Application ID, interview date, and time are required',
        });
      }

      const application = await prisma.application.findUnique({
        where: { application_id: applicationId },
        include: {
          user: true,
          job: {
            include: {
              company: true,
            },
          },
        },
      });

      if (!application) {
        return res.status(404).json({ msg: 'Application not found' });
      }

      const updatedApplication = await prisma.application.update({
        where: { application_id: applicationId },
        data: {
          interview_date: new Date(interviewDate),
          interview_time: new Date(interviewTime),
          status: 'interview',
        },
      });

      const templatePath = path.join(
        __dirname,
        '../templates/interviewSchedule.hbs',
      );
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateSource);

      const emailHtml = compiledTemplate({
        name: `${application.user.first_name} ${application.user.last_name}`,
        jobTitle: application.job.job_title,
        companyName: application.job.company?.company_name || 'the company',
        interviewDate: new Date(interviewDate).toLocaleDateString(),
        interviewTime: new Date(interviewTime).toLocaleTimeString(),
        base_fe_url: base_fe_url,
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: application.user.email,
        subject: `Interview Scheduled for ${application.job.job_title}`,
        html: emailHtml,
      });

      res.status(200).json({
        msg: 'Interview schedule updated and email sent successfully!',
        application: updatedApplication,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        msg: 'Failed to update interview schedule and send email',
        error: err.message,
      });
    }
  }

  async getInterviewSchedules(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      if (!companyId) {
        return res.status(400).json({ msg: 'Company ID is required' });
      }

      const interviewSchedules = await prisma.application.findMany({
        where: {
          job: {
            company_id: companyId,
          },
          interview_date: {
            not: null,
          },
        },
        include: {
          user: true,
          job: true,
        },
      });

      if (interviewSchedules.length === 0) {
        return res.status(404).json({ msg: 'No interview schedules found' });
      }

      const schedules = interviewSchedules.map((schedule) => ({
        id: schedule.application_id,
        applicantId: schedule.user_id,
        applicantName: `${schedule.user.first_name} ${schedule.user.last_name}`,
        date: schedule.interview_date
          ? new Date(schedule.interview_date).toLocaleDateString()
          : null,
        time: schedule.interview_time
          ? new Date(schedule.interview_time).toLocaleTimeString()
          : null,
        applicantPhotoUrl: schedule.user.profile_picture,
        position: schedule.job.job_title,
      }));

      res.status(200).json({ schedules });
    } catch (error) {
      res
        .status(500)
        .json({ msg: 'Failed to fetch interview schedules', error });
    }
  }

  async deleteInterviewSchedule(req: Request, res: Response) {
    try {
      const { scheduleId } = req.params;

      if (!scheduleId) {
        return res.status(400).json({ msg: 'Schedule ID is required' });
      }

      const deletedSchedule = await prisma.application.update({
        where: { application_id: scheduleId },
        data: {
          interview_date: null,
          interview_time: null,
          status: 'pending',
        },
      });

      if (!deletedSchedule) {
        return res
          .status(404)
          .json({ msg: 'Schedule not found or already deleted' });
      }

      res.status(200).json({ msg: 'Interview schedule deleted successfully' });
    } catch (error) {
      res
        .status(500)
        .json({ msg: 'Failed to delete interview schedule', error });
    }
  }
}
