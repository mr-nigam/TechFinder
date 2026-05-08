import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';
import upload from '#middlewares/multer.middleware.js';

import {
    getProfile,
    updateProfile,
    updateProfilePicture
} from '../controllers/profile.controller.js';


const router = Router();


router.use(verifyJWT);


router.route("/me")
    .get(getProfile)
    .patch(updateProfile);

router.patch(
    "/me/profile-picture",
    upload.single("profilePicture"),
    updateProfilePicture
);


export default router;

