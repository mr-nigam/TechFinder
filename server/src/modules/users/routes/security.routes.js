import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';

import {
    changeCurrentPassword,
    changeEmail,
    verifyEmail,
    sendEmailVerification,
    resendEmailVerification,
} from '../controllers/account.controller.js';


const router = Router();

router.use(verifyJWT);


router.patch("/email",changeEmail);

router.patch(
    "/password",
    changeCurrentPassword
);

router.post(
    "/email/verification/send",
    sendEmailVerification
);

router.post(
    "/email/verification/resend",
    resendEmailVerification
);

router.post(
    "/email/verification/verify",
    verifyEmail
);


export default router;