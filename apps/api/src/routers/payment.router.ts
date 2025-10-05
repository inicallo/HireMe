import { Router } from 'express';
import { PaymentController } from '@/controllers/payment.controller';
import { verifyToken } from '@/middlewares/token';
import { checkDeveloperRole } from '@/middlewares/checkRole';
import { uploader } from '@/middlewares/uploader';
import { cloudinaryUploader } from '@/middlewares/cloudinary.middleware'; 
import { fetchUserName } from '@/middlewares/fetchUserName';
import { generatePublicId } from '@/routers/application.router'; 

export class PaymentRouter {
  private router: Router;
  private paymentController: PaymentController;

  constructor() {
    this.paymentController = new PaymentController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Endpoint untuk upload bukti pembayaran
    this.router.post(
      '/upload',
      verifyToken,
      fetchUserName,
      uploader('payment', 'payment').single('file'),
      cloudinaryUploader('payment_proofs', generatePublicId('payment_proofs')),
      this.paymentController.uploadPaymentProof,
    );

    // Endpoint untuk konfirmasi pembayaran (hanya developer)
    this.router.post(
      '/confirm',
      verifyToken,
      checkDeveloperRole,
      this.paymentController.confirmPayment,
    );

    // Endpoint untuk mendapatkan bukti pembayaran
    this.router.get(
      '/proof/:subscriptionId',
      verifyToken,
      this.paymentController.getPaymentProof,
    );

    this.router.get(
      '/dashboard',
      verifyToken,
      checkDeveloperRole, // Hanya role developer yang bisa mengakses
      this.paymentController.getDashboardData,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
