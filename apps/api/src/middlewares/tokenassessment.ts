import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ✅ CORRECTED: Changed ID types from number to string
interface DecodedToken {
  user_id: string;
  assessment_id: string;
  role: string;
  iat: number;
  exp: number;
}

export const verifyAssessmentToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_JWT!) as DecodedToken;

    // This will now work because the types match custom.d.ts
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
    };
    req.assessment_id = decoded.assessment_id;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};