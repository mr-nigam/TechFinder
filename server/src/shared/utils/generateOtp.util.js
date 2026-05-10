import crypto from "crypto";


const generateOtp = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;

    return crypto
        .randomInt(min, max)
        .toString();
};


export default generateOtp;