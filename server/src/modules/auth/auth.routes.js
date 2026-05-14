import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';
import upload from '#middlewares/multer.middleware.js';

import {
    register,
    logIn,
    logOut,
    refreshAccessToken
} from './auth.controller.js';

import {
    forgotPassword,
    verifyForgotOTP,
    resetPassword
} from './controllers/password.controller.js';


const router = Router();


// Public Routes
router.post(
    "/register",
    upload.single("profilePicture"),
    register
);

router.post("/login", logIn);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-forgot-otp",
    verifyForgotOTP
);

router.post(
    "/reset-password",
    resetPassword
);

// Proctected Routes
router.post(
    "/logout",
    verifyJWT,
    logOut
);


export default router;