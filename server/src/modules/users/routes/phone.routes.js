import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';

import {
    addPhone,
    getPhones,
    deletePhone,
} from '../controllers/phone.controller.js';


const router = Router();


router.use(verifyJWT);


router.route("/")
    .post(addPhone)
    .get(getPhones);

router.route("/:phoneId")
    .delete(deletePhone);


export default router;