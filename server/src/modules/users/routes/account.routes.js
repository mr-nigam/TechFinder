import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';

import {
    deactivateAccount,
    reactivateAccount,
    deleteAccount
} from '../controllers/account.controller.js';


const router = Router();


router.use(verifyJWT);


router.delete("/delete",deleteAccount);

router.patch("/deactivate",deactivateAccount);

router.patch("/reactivate",reactivateAccount);


export default router;