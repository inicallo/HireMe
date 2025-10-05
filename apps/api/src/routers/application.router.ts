import { Router, Request, Response } from 'express';
import { ApplicationController } from '#/controllers/application.controller';
import { verifyToken } from '#/middlewares/token';
import { validateApplicationData } from '#/middlewares/validateApplicationData';
import { uploader } from '#/middlewares/uploader';
import { checkAdminDev, checkCandidate } from '#/middlewares/checkRole';
import { cloudinaryUploader } from '#/middlewares/cloudinary.middleware';
import { fetchUserName } from '#/middlewares/fetchUserName';

const resumeUploader = uploader('resume', 'resume');

export const generatePublicId = (folder: string) => {
  return (req: Request) => {
    const user = req.user as any;

    if (!user || !user.first_name || !user.last_name) {
      return `${folder}_unknown_${Date.now()}`;
    }

    const firstName = String(user.first_name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const lastName = String(user.last_name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    return `${folder}_${firstName}${lastName}`;
  };
};

export class ApplicationRouter {
  private router: Router;
  private applicationController: ApplicationController;

  constructor() {
    this.applicationController = new ApplicationController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/apply',
      verifyToken,
      fetchUserName,
      checkCandidate,
      resumeUploader.single('resume'),
      cloudinaryUploader('resumes', generatePublicId('resumes')),
      validateApplicationData,
      this.applicationController.createApplication,
    );

    this.router.get(
      '/user/applications',
      verifyToken,
      checkCandidate,
      this.applicationController.getApplicationsByUser,
    );

    this.router.get(
      '/:applicationId',
      verifyToken,
      checkCandidate,
      this.applicationController.getApplicationById,
    );

    this.router.patch(
      '/:applicationId/status',
      verifyToken,
      checkAdminDev,
      this.applicationController.updateApplicationStatus,
    );

    this.router.get(
      '/user/:userId/recent',
      verifyToken,
      this.applicationController.getRecentlyAppliedJobs,
    );
    this.router.get(
      '/job/:jobId',
      verifyToken,
      checkAdminDev,
      this.applicationController.getApplicationsByJobId,
    );
    this.router.get(
      '/interview-applicants/:companyId',
      this.applicationController.getInterviewApplicantsByCompany,
    );
    this.router.get(
      '/interview-schedules/:companyId',
      this.applicationController.getInterviewSchedules,
    );
    this.router.delete(
      '/interview-schedules/:scheduleId',
      this.applicationController.deleteInterviewSchedule,
    );

    this.router.patch(
      '/:applicationId/interview-schedule',
      this.applicationController.updateInterviewSchedule,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
