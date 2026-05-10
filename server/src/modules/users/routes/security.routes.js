import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';

import {
    resetPassword,
    changeEmail,
    sendEmailOtp,
    verifyEmail,
    changePhone,
    sendPhoneOtp,
    verifyPhone
} from '../controllers/security.controller.js';


const router = Router();


router.use(verifyJWT);


router.patch("/password", resetPassword);

router.patch("/email",changeEmail);

router.post("/email/send-otp",sendEmailOtp);

router.post("/email/verify-otp", verifyEmail);

router.patch("/phone", changePhone);

router.post("/phone/send-otp",sendPhoneOtp);

router.post( "/phone/verify-otp",verifyPhone);


export default router;