import { JobController } from '#/controllers/job.controller';
import { verifyToken } from '#/middlewares/token';
import { checkAdminDev, checkRole, checkCandidate} from '#/middlewares/checkRole';
import { Router } from 'express';

export class JobRouter {
  private router: Router;
  private jobController: JobController;

  constructor() {
    this.jobController = new JobController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
  this.router.get('/company/:companyId', this.jobController.getJobsByCompanyId);
  this.router.get('/applied/count', verifyToken, checkCandidate, this.jobController.getAppliedJobCount);
  this.router.get('/favorites/count', verifyToken, checkCandidate, this.jobController.getFavoriteJobCount);
  this.router.post('/favorites/toggle', verifyToken, checkCandidate, this.jobController.toggleSaveJob);
  this.router.get('/recently-posted/:userId', verifyToken, checkAdminDev, this.jobController.getRecentlyPostedJobs);
  this.router.get('/total-jobs-count/:userId', verifyToken, this.jobController.getTotalJobsCount);
  this.router.get('/applicants/count', verifyToken, checkAdminDev, this.jobController.getTotalApplicantsCount);
  
  this.router.get('/', this.jobController.getJobs);
  this.router.get('/:id', this.jobController.getJobById);

  this.router.post('/', verifyToken, checkAdminDev, this.jobController.createJob);
  this.router.patch('/:id', this.jobController.updateJob);
  this.router.delete('/:id', this.jobController.deleteJob);

  }

  getRouter(): Router {
    return this.router;
  }
}
