const { App } = require('./app');
const { connectDB } = require('./utils/connectDB');

connectDB();

const app = new App();
module.exports = app.getApp();