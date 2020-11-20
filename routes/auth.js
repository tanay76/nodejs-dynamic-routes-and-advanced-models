const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/activate/activation/:token', authController.getActivated);
router.get('/reset-password', authController.getResetPassword);
router.get('/new-password/:token', authController.getNewPassword);

router.post('/signup', authController.postSignup);
router.post('/login', authController.postLogin);
router.post('/activation-login', authController.postActivate);
router.post('/reset-password', authController.postResetPassword);
router.post('/new-password', authController.postNewPassword);

router.post('/logout', authController.postLogout);

module.exports = router;