import { NotificationController } from '../controllers/notification.controller';
import { verifyToken } from '../middlewares/token';
import { Router } from 'express';

export class NotificationRouter {
  private router: Router;
  private notificationController: NotificationController;

  constructor() {
    this.notificationController = new NotificationController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', verifyToken, this.notificationController.getUserNotifications);
    this.router.patch('/:notificationId/read', verifyToken, this.notificationController.markAsRead);
    this.router.patch('/mark-all-read', verifyToken, this.notificationController.markAllAsRead);

  }

  getRouter(): Router {
    return this.router;
  }
}
