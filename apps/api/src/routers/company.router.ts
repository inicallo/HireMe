import { CompanyController } from '#/controllers/company.controller';
import { verifyToken } from '#/middlewares/token';
import { logoBannerUploader } from '#/middlewares/logoBannerUploader';
import { Router } from 'express';
import { checkAdminDev } from '#/middlewares/checkRole';
import { handleCompanyMedia } from '#/middlewares/companyMediaHandler';
import { fetchUserName } from '#/middlewares/fetchUserName';

export class CompanyRouter {
  private router: Router;
  private companyController: CompanyController;

  constructor() {
    this.companyController = new CompanyController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/',
      verifyToken,
      fetchUserName,
      logoBannerUploader,
      handleCompanyMedia,
      this.companyController.createCompany.bind(this.companyController),
    );

    this.router.put(
      '/:id',
      logoBannerUploader,
      fetchUserName,
      handleCompanyMedia,
      this.companyController.updateCompany.bind(this.companyController),
    );

    this.router.get(
      '/search',
      verifyToken,
      this.companyController.getCompanies.bind(this.companyController),
    );
    this.router.get(
      '/user',
      verifyToken,
      this.companyController.getUserCompany.bind(this.companyController),
    );
    this.router.get(
      '/:id',
      this.companyController.getCompanyById.bind(this.companyController),
    );

    this.router.get(
      '/',
      this.companyController.getAllCompanies.bind(this.companyController),
    );

    this.router.delete(
      '/:id',
      verifyToken,
      checkAdminDev,
      this.companyController.deleteCompany.bind(this.companyController),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
