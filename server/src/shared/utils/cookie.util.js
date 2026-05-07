const isProduction =
    process.env.NODE_ENV === "production";

const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
});

const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


export {
    getAccessCookieOptions,
    getRefreshCookieOptions,
};