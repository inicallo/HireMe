import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '@/config';

const prisma = new PrismaClient();

export const connectDB = async () => {
  if (!DATABASE_URL) {
    console.error('FATAL ERROR: DATABASE_URL is not defined.');
    return;
  }
  
  try {
    await prisma.$connect();
  } catch (err) {
    process.exit(1); 
  }
};