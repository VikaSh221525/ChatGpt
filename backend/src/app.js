const express = require('express');
const cookieParser = require('cookie-parser');

// routes
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');

const app = express();

// using middlewares 
app.use(express.json());
app.use(cookieParser());

// using Routes
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)

module.exports = app;