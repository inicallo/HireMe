import App from './app';
import { connectDB } from './utils/connectDB';

// Establish database connection
connectDB();

// Create an instance of the app
const app = new App();

// Export the Express app for Vercel
export default app.getApp();