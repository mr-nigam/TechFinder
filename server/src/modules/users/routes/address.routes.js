import { Router } from 'express';
import verifyJWT from '#middlewares/auth.middleware.js';

import {
    addAddress,
    getAddressById,
    getMyAddresses,
    deleteAddress,
    changeDefaultAddress,
    updateAddress,
    updateAddressLocation,
    addAddressAssets,
    updateAddressAssets
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

router.patch("/:addressId/default", changeDefaultAddress);

router.patch("/:addressId/location", updateAddressLocation);

router.post("/:addressId/assets", addAddressAssets);

router.patch("/:addressId/assets", updateAddressAssets);


export default router;