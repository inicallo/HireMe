declare namespace Express {
  export interface Request {
    user?: {
      user_id: string;
      role: string;
      company_id?: string; 
    };
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] };
    assessment_id?: string;
  }
}