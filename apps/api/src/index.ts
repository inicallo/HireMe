const { App } = require('./AppClass'); 
const { connectDB } = require('./utils/connectDB');

connectDB();

const app = new App();
module.exports = app.getApp();