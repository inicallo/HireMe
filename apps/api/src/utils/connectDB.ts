import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../config';

const prisma = new PrismaClient();

export const connectDB = async () => {
  if (!DATABASE_URL) {
    console.error('FATAL ERROR: DATABASE_URL is not defined.');
    throw new Error('Database URL is not configured.'); 
  }
  
  try {
    await prisma.$connect();
    try {
        // Enforce unique index on User.email
        await prisma.$runCommandRaw({
            createIndexes: "User", 
            indexes: [{ key: { email: 1 }, name: "email_1", unique: true }]
        });
        
        // Enforce unique index on Company.email
        await prisma.$runCommandRaw({
            createIndexes: "Company", 
            indexes: [{ key: { email: 1 }, name: "Company_email_1", unique: true }]
        });

        // Enforce unique index on UserAssessmentScore.unique_code
        await prisma.$runCommandRaw({
            createIndexes: "UserAssessmentScore", 
            indexes: [{ key: { unique_code: 1 }, name: "unique_code_1", unique: true }]
        });
        
        console.log("MongoDB unique indexes ensured for User, Company, and Scores.");
    } catch (indexError: any) {
        // We generally suppress index-already-exists errors here
        if (!indexError.message.includes('Index already exists')) {
             console.error("Warning: Could not explicitly create unique index:", indexError);
        }
    }
    
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1); 
  }
};