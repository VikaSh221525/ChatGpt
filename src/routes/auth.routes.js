const express = require('express');
const {getRegisterController, getLoginController, postRegisterController, postLoginController} = require('../controllers/auth.controller')
const router = express.Router();

router.route('/register')
    .get(getRegisterController)
    .post(postRegisterController)

router.route('/login')
    .get(getLoginController)
    .post(postLoginController)

module.exports = router