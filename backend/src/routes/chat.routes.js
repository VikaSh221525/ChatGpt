const express = require('express');
const { authUser } = require('../middleware/auth.middleware');
const { createChat } = require('../controllers/chat.controller');

const router = express.Router();


// /api/chat/, middleware, controller
router.post('/', authUser, createChat)

module.exports = router;