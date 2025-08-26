const express = require('express');
const { authUser } = require('../middleware/auth.middleware');
const { createChat, getChats } = require('../controllers/chat.controller');

const router = express.Router();


// /api/chat/, middleware, controller
router.post('/', authUser, createChat)

// get/api/chat/
router.get('/', authUser, getChats)

module.exports = router;