import { Router } from 'express';
import { UserPlanController } from '../controllers/userplan.controller';
import { verifyToken } from '../middlewares/token';


export class PlanBillRouter {
  private router: Router;
  private userPlanController: UserPlanController;

  constructor() {
    this.userPlanController = new UserPlanController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/subscription', verifyToken, this.userPlanController.getUserSubscriptions);
    this.router.get('/payment', verifyToken, this.userPlanController.getUserPayments);

  }

  getRouter(): Router {
    return this.router;
  }
}
