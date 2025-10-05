import { PreSelectionTestController } from '../controllers/preselection.controller';
import { verifyToken } from '../middlewares/token';
import { checkAdminDev } from '../middlewares/checkRole';
import { Router } from 'express';

export class PreSelectionTestRouter {
  private router: Router;
  private preSelectionTestController: PreSelectionTestController;

  constructor() {
    this.preSelectionTestController = new PreSelectionTestController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/test', (req, res) => {
      console.log('✅ Preselection router test route was hit!');
      res.status(200).send('Preselection router is working!');
    });

    this.router.post(
      '/job/:jobId/link',
      verifyToken,
      checkAdminDev,
      (req, res) => this.preSelectionTestController.createTestLink(req, res),
    );

    this.router.get('/job/:jobId', verifyToken, checkAdminDev, (req, res) =>
      this.preSelectionTestController.getAssessmentStatus(req, res),
    );

    this.router.delete(
      '/job/:jobId/unlink',
      verifyToken,
      checkAdminDev,
      (req, res) => this.preSelectionTestController.deleteTestLink(req, res),
    );

    this.router.post('/add-question', verifyToken, checkAdminDev, (req, res) =>
      this.preSelectionTestController.addQuestion(req, res),
    );

    this.router.post('/save-answer', verifyToken, (req, res) =>
      this.preSelectionTestController.saveTestAnswer(req, res),
    );

    this.router.get('/:testId', (req, res) =>
      this.preSelectionTestController.getTestWithQuestions(req, res),
    );

    this.router.get(
      '/get-questions/:jobId',
      this.preSelectionTestController.getQuestionsByJobId,
    );

    this.router.get(
      '/check-test/:jobId',
      this.preSelectionTestController.checkTest,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
