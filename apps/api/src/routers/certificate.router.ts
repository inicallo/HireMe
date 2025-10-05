import { Router } from "express";
import { verifyToken } from "../middlewares/token";
import { CertificateController } from "../controllers/certificate.controller";

export class CertificateRouter {
  private router: Router;
  private certificateController: CertificateController;

  constructor() {
    this.certificateController = new CertificateController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Generate certificate - Requires authentication
    this.router.get(
      "/generate/:score_id",
      verifyToken,
      this.certificateController.generateCertificate.bind(
        this.certificateController
      )
    );

    // Verify certificate - Optional authentication
    this.router.get(
      "/verify",
      this.certificateController.verifyCertificate.bind(
        this.certificateController
      )
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new CertificateRouter().getRouter();
