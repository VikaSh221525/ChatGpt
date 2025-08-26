const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')

// routes
const authRouter = require('./routes/auth.routes');
const chatRouter = require('./routes/chat.routes');

const app = express();

// using middlewares 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// using Routes
app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)

module.exports = app;