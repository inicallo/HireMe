import App from './app';

// Instantiate the App class to configure Express
const app = new App();

// Get the configured Express instance
const expressApp = app.getApp();

// Export the instance for Vercel to use
module.exports = expressApp;