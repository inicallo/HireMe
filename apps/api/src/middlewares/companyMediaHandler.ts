import { Request, Response, NextFunction } from 'express';
import { cloudinaryUploader } from './cloudinary.middleware';
import { generatePublicId } from '../routers/application.router';

interface MultiFiles extends Request {
  files?: {
    logo?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };
}

export const handleCompanyMedia = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const customReq = req as MultiFiles;

  try {
    const files = customReq.files;

    if (files?.logo && files.logo.length > 0) {
      customReq.file = files.logo[0];

      await new Promise((resolve, reject) => {
        cloudinaryUploader('company_logos', generatePublicId('company_logos'))(
          customReq,
          res,
          (err) => {
            if (err) return reject(err);
            resolve(null);
          },
        );
      });

      customReq.body.logoUrl = customReq.body.fileUrl;
      customReq.body.fileUrl = undefined;
    }

    if (files?.banner && files.banner.length > 0) {
      customReq.file = files.banner[0];

      await new Promise((resolve, reject) => {
        cloudinaryUploader(
          'company_banners',
          generatePublicId('company_banners'),
        )(customReq, res, (err) => {
          if (err) return reject(err);
          resolve(null);
        });
      });

      customReq.body.bannerUrl = customReq.body.fileUrl;
      customReq.body.fileUrl = undefined;
    }

    customReq.file = undefined;
    next();
  } catch (error) {
    next(error);
  }
};
