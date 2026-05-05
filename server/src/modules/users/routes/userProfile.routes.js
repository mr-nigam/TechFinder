import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware';
import upload from '#middlewares/multer.middleware';

import {
    getMyProfile,
    updateUserProfile,
    updateProfilePicture
} from '../controllers/userProfile.controller.js';


const router = Router();


router.use(verifyJWT);

router.route("/me")
    .get(getMyProfile)
    .patch(updateUserProfile);

router.patch(
    "/me/profile-picture",
    upload.single("profilePicture"),
    updateProfilePicture
);

export default router;

