import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../config';

export const cloudinaryUploader = (folderName: string, getPublicId?: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }
    const uniquePublicId = getPublicId ? getPublicId(req) : `${folderName}_${Date.now()}`;
    
    const finalPublicId = uniquePublicId || `${folderName}_${Date.now()}`;


    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `purwadhika-project/${folderName}`,
            public_id: finalPublicId,
            resource_type: 'auto',
            tags: [folderName, 'uploaded_by_api'],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );

        uploadStream.end(req.file!.buffer);
      });

      req.body.fileUrl = result.secure_url;
      req.body.filePublicId = result.public_id;

      next();
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      // Return a 500 status if the upload fails
      return res.status(500).json({
        status: 'error',
        msg: 'File upload failed.',
        error: (error as Error).message,
      });
    }
  };
};
