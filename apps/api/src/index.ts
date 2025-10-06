const AppClass = require('./AppClass'); 
const { connectDB } = require('./utils/connectDB');

connectDB();

const app = new AppClass(); 

module.exports = app.getApp();