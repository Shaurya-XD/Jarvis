import {createUserController, loginUserController, userProfileController, userLogoutController, getAllUsersController} from '../controllers/user.controller.js'
import { body } from 'express-validator';
import { authUser } from "../middleware/auth.middleware.js";
import { Router } from "express";
const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Enter a valid Email address'),
    body('password').isLength({min: 6}).withMessage('Password must contain at least 6 characters'),
    createUserController);

router.post('/login',
    body('email').isEmail().withMessage('Enter a valid Email address'),
    body('password').isLength({min: 6}).withMessage('Password must contain at least 6 characters'),
    loginUserController);

router.get('/profile', authUser, userProfileController);

router.get('/logout', authUser, userLogoutController);

router.get('/all', authUser, getAllUsersController);

export default router; 