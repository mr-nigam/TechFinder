import { Router } from 'express';
import verifyJWT from 
'#middlewares/auth.middleware.js';


import {
    createReview,
    getReviewById,
    updateReview,
    deleteReview,
    getReviews
} from './review.controller.js';


const router = Router();

router.use(verifyJWT);


router.post('/booking/:bookingId', createReview);

router.get('/technician/:username', getReviews);

router.route("/:reviewId")
    .get(getReviewById)
    .patch(updateReview)
    .delete(deleteReview);


export default router;