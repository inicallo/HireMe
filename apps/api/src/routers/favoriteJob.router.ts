import { verifyToken } from '../middlewares/token';
import { checkAdminDev, checkRole, checkCandidate} from '../middlewares/checkRole';
import { Router } from 'express';
import { FavoriteJobController } from '../controllers/favoriteJob.controller';

export class FavoriteJobRouter {
  private router: Router;
  private favoriteJobController: FavoriteJobController;

  constructor() {
    this.favoriteJobController = new FavoriteJobController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', verifyToken, checkCandidate, this.favoriteJobController.getFavoriteJobs);

    this.router.get('/check-applied', verifyToken, this.favoriteJobController.checkApplicationStatus);
  }

  getRouter(): Router {
    return this.router;
  }
}
