import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';
import upload from '#middlewares/multer.middleware';

import {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword
} from './auth.controller.js'


const router = Router();


// Public Routes
router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", logInUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Proctected Routes
router.post("/logout", verifyJWT, logOutUser);


export default router;