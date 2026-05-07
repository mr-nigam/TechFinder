import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';

import {
    changePassword,
    changeEmail,
    verifyEmail,
    sendEmailOtp,
    changePrimaryPhone,
    verifyPrimaryPhone,
    sendPrimaryPhoneOtp
} from '../controllers/security.controller.js';


const router = Router();


router.use(verifyJWT);


router.patch("/password", changePassword);

router.patch("/email",changeEmail);

router.post("/email/verify", verifyEmail);

router.post("/email/otp",sendEmailOtp);

router.patch("/primary-phone", changePrimaryPhone);

router.post( "/primary-phone/verify",verifyPrimaryPhone);

router.post("/primary-phone/otp",sendPrimaryPhoneOtp);


export default router;