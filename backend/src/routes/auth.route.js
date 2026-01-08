import express from 'express';
import authController from '../controller/auth.controller.js';

const router = express.Router();

router.post('/signup', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

export default router;