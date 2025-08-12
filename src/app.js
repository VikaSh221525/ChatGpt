const express = require('express');
const indexRoutes = require('./routes/index.routes');
const authRoutes = require('./routes/auth.routes');
const app = express()

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/', indexRoutes)
app.use('/auth', authRoutes)

module.exports = app;