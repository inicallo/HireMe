import { App } from './app';
import { connectDB } from './utils/connectDB';

connectDB();
const app = new App();

module.exports = app.getApp();