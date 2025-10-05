import { Router } from 'express';
import { AnalyticsController } from '#/controllers/analytics.controller';

export class AnalyticsRouter {
  private router: Router;
  private analyticsController: AnalyticsController;

  constructor() {
    this.analyticsController = new AnalyticsController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/applicant-interests', this.analyticsController.getApplicantInterests);
    this.router.get('/other-data', this.analyticsController.getOtherImportantData);
    this.router.get('/salary-trends', this.analyticsController.getSalaryTrends);
    this.router.get('/user-demographics', this.analyticsController.getUserDemographics);
  }

  getRouter(): Router {
    return this.router;
  }
}
