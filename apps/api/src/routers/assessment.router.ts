import { Router } from "express";
import { AssessmentController } from '../controllers/assessment.controller';
import { verifyToken } from '../middlewares/token';
import { checkDeveloperRole } from '../middlewares/checkRole';
import { verifyAssessmentToken } from '../middlewares/tokenassessment';
import { checkFeatureLimit } from '../middlewares/premiumFeature';

export class AssessmentRouter {
  private router: Router;
  private assessmentController: AssessmentController;

  constructor() {
    this.assessmentController = new AssessmentController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/create',
      verifyToken,
      checkDeveloperRole,
      this.assessmentController.createAssessment.bind(
        this.assessmentController,
      ),
    );
    this.router.delete(
      '/delete/:assessment_id',
      verifyToken,
      checkDeveloperRole,
      this.assessmentController.deleteAssessment.bind(
        this.assessmentController,
      ),
    );
    this.router.get(
      '/all',
      verifyToken,

      this.assessmentController.getAllAssessments.bind(
        this.assessmentController,
      ),
    );
    this.router.get(
      '/start/:assessment_id',
      verifyToken,
      checkFeatureLimit,
      this.assessmentController.startAssessment.bind(this.assessmentController),
    );
    this.router.post(
      '/submit',
      verifyAssessmentToken,
      this.assessmentController.submitAssessment.bind(
        this.assessmentController,
      ),
    );
    this.router.get(
      '/user-score',
      verifyToken,
      this.assessmentController.getUserAssessmentScore.bind(
        this.assessmentController,
      ),
    );
    this.router.get(
      '/user-score/badge/:user_id',
      this.assessmentController.getUserBadgesById.bind(
        this.assessmentController,
      ),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
