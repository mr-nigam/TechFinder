import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';

import {
    addPhoneNumber,
    getMyPhoneNumbers,
    deletePhoneNumber,
    setDefaultPhoneNumber,
    sendPhoneNumberOtp,
    resendPhoneNumberOtp,
    verifyPhoneNumber
} from '../controllers/phoneNumbers.controller.js';


const router = Router();


router.use(verifyJWT);


router.route("/")
    .post(addPhoneNumber)
    .get(getMyPhoneNumbers);


router.delete("/:phoneNumberId",deletePhoneNumber);

router.patch("/:phoneNumberId/default",setDefaultPhoneNumber);

router.post("/:phoneNumberId/verification/send",sendPhoneNumberOtp);

router.post("/:phoneNumberId/verification/resend",resendPhoneNumberOtp);

router.post("/:phoneNumberId/verification/verify",verifyPhoneNumber);


export default router;