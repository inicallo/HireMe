import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const maxSize = 5 * 1024 * 1024;

export const logoBannerUploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);