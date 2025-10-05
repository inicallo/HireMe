import { Request, Response } from 'express';
import prisma from '#/prisma';
import { generatePdf } from '#/utils/pdfCVGenerator';

export class CvController {
  async createOrUpdateCV(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const { template, content } = req.body;

      if (!user_id) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }
      const existingCv = await prisma.cV.findFirst({
        where: { user_id },
      });

      if (existingCv) {
        const updatedCv = await prisma.cV.update({
          where: { cv_id: existingCv.cv_id },
          data: { template, content },
        });
        return res.status(200).json({ status: 'success', message: 'CV updated successfully', data: updatedCv });
      }

      const newCv = await prisma.cV.create({
        data: { user_id, template, content },
      });
      res.status(201).json({ status: 'success', message: 'CV created successfully', data: newCv });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ status: 'error', message });
    }
  }

  async getCVbyId(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const cv_id = req.params.cv_id; // It's a string

      const cv = await prisma.cV.findUnique({ where: { cv_id } });
      if (!cv) return res.status(404).json({ status: 'error', message: `CV with ID ${cv_id} not found.` });
      if (cv.user_id !== user_id) return res.status(403).json({ status: 'error', message: 'Forbidden. You do not have access to this CV.' });

      res.status(200).json({ status: 'success', data: cv });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching CV:', error);
      res.status(500).json({ status: 'error', message });
    }
  }
  
  async getCvs(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) return res.status(401).json({ message: 'Unauthorized' });
      
      const cvs = await prisma.cV.findMany({ where: { user_id } });
      if (!cvs || cvs.length === 0) return res.status(200).json({ cvs: [] });
      
      res.status(200).json({ cvs });
    } catch (error) {
      console.error('Error fetching CVs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async downloadCV(req: Request, res: Response) {
    try {
      const user_id = req.user?.user_id;
      const cv_id = req.params.cv_id; // It's a string

      const cv = await prisma.cV.findUnique({ where: { cv_id } });
      if (!cv) return res.status(404).json({ status: 'error', message: 'CV not found' });
      if (cv.user_id !== user_id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

      // Assuming cv.content is the correct type for generatePdf
      const pdfBuffer = await generatePdf(cv.content as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="cv-${cv_id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ status: 'error', message });
    }
  }
}