declare namespace Express {
  interface Request {
    
    user?: {
      user_id: string;
      role: string;
      company_id?: string;
      first_name?: string;
      last_name?: string;
      assessment_id?: string
    };

    assessment_id?: string

    file?: import('express').Multer.File; 
    
    fileUrl?: string;
    filePublicId?: string;
  }
}