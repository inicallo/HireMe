import { CvController } from '../controllers/cv.controller';
import {
  checkActiveSubscription,
} from '../middlewares/premiumFeature';
import { verifyToken } from '../middlewares/token';
import { Router } from 'express';

export class CvRouter {
  private router: Router;
  private cvController: CvController;

  constructor() {
    this.cvController = new CvController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Create or Update CV
    this.router.post(
      '/generator',
      verifyToken,
      checkActiveSubscription,
      this.cvController.createOrUpdateCV.bind(this.cvController),
    );

    // Get a specific CV
    this.router.get('/:cv_id', verifyToken, this.cvController.getCVbyId.bind(this.cvController));

    // Download a specific CV
    this.router.get(
      '/:cv_id/download',
      verifyToken,
      this.cvController.downloadCV.bind(this.cvController),
    );

    // Get all CVs for the logged-in user
    this.router.get('/', verifyToken, this.cvController.getCvs.bind(this.cvController)); // New endpoint
  }

  getRouter(): Router {
    return this.router;
  }
}
