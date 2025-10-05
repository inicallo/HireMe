import { Request, Response } from 'express';
import { certificatePDF } from '@/utils/pdfCertificate';
import QRCode from 'qrcode';
import prisma from '@/prisma';

interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: string;
    company_id?: string;
  };
}

export class CertificateController {
  public async generateCertificate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user || {};
      const { score_id } = req.params;

      if (!score_id) {
        res.status(400).json({ message: 'Invalid score_id provided.' });
        return;
      }
      if (!user_id) {
         res.status(401).json({ message: 'Unauthorized. User ID is missing.' });
         return;
      }

      const userAssessmentScore =
        await prisma.userAssessmentScore.findFirst({
          where: { score_id, user_id, status: 'passed' },
          include: {
            user: true,
            skillAssessment: true,
          },
        });

      if (!userAssessmentScore) {
        res.status(404).json({
          message: 'No passed assessments found for the provided score ID.',
        });
        return;
      }
      if (userAssessmentScore.status !== 'passed') {
        res.status(400).json({
          message: 'Certificate can only be generated for passed assessments.',
        });
        return;
      }

      const qrCodeData = await QRCode.toDataURL(
        `${process.env.BASE_FE_URL!}/certificate-verify?code=${userAssessmentScore.unique_code}`,
      );
      
      // ✅ FIX: Removed parseInt and pass the string ID directly
      await certificatePDF(res, {
        score_id: userAssessmentScore.score_id, 
        assessment_data:
          userAssessmentScore.skillAssessment?.assessment_data?.toString() || 'Assessment data not available',
        score: userAssessmentScore.score!,
        user_name: `${userAssessmentScore.user!.first_name || 'Unknown'} ${
          userAssessmentScore.user!.last_name || 'User'
        }`,
        badge: userAssessmentScore.badge || 'No badge',
        qrCodeData,
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : error 
      });
    }
  }

  public async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
  
      if (!code || typeof code !== 'string' || code.length !== 36) {
        res.status(400).json({ message: 'Invalid or missing certificate code.' });
        return;
      }
  
      const userAssessmentScore = await prisma.userAssessmentScore.findUnique({
        where: { unique_code: code },
        include: {
          user: true,
          skillAssessment: true,
        },
      });
  
      if (!userAssessmentScore) {
        res.status(404).json({ message: 'Certificate not found.' });
        return;
      }
  
      if (userAssessmentScore.status !== 'passed') {
        res.status(400).json({ message: 'This certificate is not verified.' });
        return;
      }
  
      res.status(200).json({
        message: 'Certificate is valid',
        certificate: {
          unique_code: userAssessmentScore.unique_code,
          user_name: `${userAssessmentScore.user!.first_name} ${userAssessmentScore.user!.last_name}`,
          assessment_name:
            userAssessmentScore.skillAssessment?.assessment_data?.toString() || "Unknown Assessment",
          badge: userAssessmentScore.badge,
          score: userAssessmentScore.score,
          issued_at: userAssessmentScore.created_at,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}