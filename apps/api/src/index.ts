import express from 'express'; 
const AppClass = require('./AppClass'); 
const { connectDB } = require('./utils/connectDB');
const { PORT } = require('./config'); 

connectDB();

const app = new AppClass(); 

const server = app.getApp();

if (process.env.NODE_ENV === 'development') {
    server.listen(PORT, () => {
        console.log(`✅ API Server listening on port ${PORT}`);
        console.log(`   Local URL: http://localhost:${PORT}/api`);
    });
}

module.exports = app.getApp();