const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const {isAuthenticated} = require('../middleware/auth');

router.post("/register", authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/', isAuthenticated, authController.getUserInfo);
router.post('/reset', authController.resetPassword);
router.post('/reset/:token', authController.verifyToken);

module.exports = router;