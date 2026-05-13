const isProduction =
    process.env.NODE_ENV === "production";

const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
};

const getAccessTokenCookieOptions = () => ({
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
});

const getRefreshTokenCookieOptions = () => ({
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const setAuthCookies = (
    res,
    accessToken,
    refreshToken
) => {

    res.cookie(
        "accessToken",
        accessToken,
        getAccessTokenCookieOptions()
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        getRefreshTokenCookieOptions()
    );
};

const clearAuthCookies = (res) => {

    res.clearCookie(
        "accessToken",
        baseCookieOptions
    );

    res.clearCookie(
        "refreshToken",
        baseCookieOptions
    );
};


export {
    getAccessTokenCookieOptions,
    getRefreshTokenCookieOptions,
    setAuthCookies,
    clearAuthCookies
};