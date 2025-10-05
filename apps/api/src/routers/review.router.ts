import { Router } from 'express';
import { verifyToken } from '../middlewares/token';
import { ReviewController } from '../controllers/review.controller';

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.reviewController = new ReviewController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/create',
      verifyToken,
      this.reviewController.createReview,
    );
    this.router.get('/:company_id', this.reviewController.getReviewsByCompany);
    this.router.get(
      '/:company_id/average-rating',
      this.reviewController.getAverageRatingByCompany,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
