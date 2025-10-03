import { config } from 'dotenv';
import { resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary v2

export const NODE_ENV = process.env.NODE_ENV || 'development';

const envFile = NODE_ENV === 'development' ? '.env.development' : '.env';

config({ path: resolve(__dirname, `../${envFile}`) });
config({ path: resolve(__dirname, `../${envFile}.local`), override: true });

// Load all environment variables from .env file
// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Exports ---

// Export the configured Cloudinary client
export { cloudinary };

// Export other required variables
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const SECRET_JWT = process.env.SECRET_JWT || '';
export const MAIL_USER = process.env.MAIL_USER || '';
export const MAIL_PASS = process.env.MAIL_PASS || '';
export const BASE_API_URL = process.env.BASE_API_URL || '';
export const BASE_FE_URL = process.env.BASE_FE_URL || '';
