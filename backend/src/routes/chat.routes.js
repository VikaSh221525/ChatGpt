const express = require('express');
const { authUser } = require('../middleware/auth.middleware');

const router = express.Router();


// /api/chat/
router.post('/', authUser)

module.exports = router;