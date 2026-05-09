import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';

import {
    addAddress,
    getAddressById,
    getMyAddresses,
    deleteAddress,
    setDefault,
    updateAddress,
    updateLocation,
    addAssets,
    updateAssets
} from '../controllers/address.controller.js';


const router = Router();


router.use(verifyJWT);


router.route("/")
    .post(addAddress)
    .get(getMyAddresses);

router.route("/:addressId")
    .get(getAddressById)
    .patch(updateAddress)
    .delete(deleteAddress);

router.patch("/:addressId/default", setDefault);

router.patch("/:addressId/location", updateLocation);

router.post("/:addressId/assets", addAssets);

router.patch("/:addressId/assets", updateAssets);


export default router;