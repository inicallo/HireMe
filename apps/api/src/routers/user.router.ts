import { UserController } from '#/controllers/user.controller';
import { verifyToken } from '#/middlewares/token';
import { uploader } from '#/middlewares/uploader';
import { cloudinaryUploader } from '#/middlewares/cloudinary.middleware';
import { fetchUserName } from '#/middlewares/fetchUserName';
import { generatePublicId } from '#/routers/application.router';
import { Router } from 'express';

const profilePictureUploader = uploader('profile', 'profile_picture');

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', verifyToken, this.userController.getUser);
    this.router.get('/:id', this.userController.getUserId);
    this.router.put(
      '/update',
      verifyToken,
      fetchUserName,
      profilePictureUploader.single('profile_picture'),
      cloudinaryUploader('profile_pictures', generatePublicId('profile_pictures')),
      this.userController.updateUser,
    );

    this.router.post('/', this.userController.createUser);
    this.router.post('/login', this.userController.loginUser);
    this.router.patch('/verify', verifyToken, this.userController.verifyUser);

    this.router.post(
      '/resend-verification',
      this.userController.resendVerificationLink,
    );
    this.router.post(
      '/request-password-reset',
      this.userController.requestPasswordReset,
    );
    this.router.post('/reset-password', this.userController.resetPassword);

    // Social login route
    this.router.post(
      '/social-login',
      this.userController.socialLogin.bind(this.userController),
    );

    this.router.delete(
      '/delete',
      verifyToken,
      this.userController.deleteUser.bind(this.userController),
    );

    // dashboard user data subscription history
    this.router.get(
      '/subscriptions',
      verifyToken,
      this.userController.getUserSubscriptions,
    );

    // dashboard user data payment history
    this.router.get(
      '/payments',
      verifyToken,
      this.userController.getUserPayments,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
