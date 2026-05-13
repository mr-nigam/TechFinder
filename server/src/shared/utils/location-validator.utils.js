import ApiError from "#utils/ApiError.js";


const allowedSources = [
    "gps",
    "manual_pin",
    "geocoded",
    "admin"
];

const parseAndValidateCoordinates = ({
    lat,
    lng,
    accuracy_meters,
    source
}) => {

    if (
        lat === undefined ||
        lng === undefined
    ) {
        throw new ApiError(
            400,
            "Give proper location coordinates"
        );
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (
        isNaN(parsedLat) ||
        isNaN(parsedLng) ||
        parsedLat > 90 ||
        parsedLat < -90 ||
        parsedLng > 180 ||
        parsedLng < -180
    ) {
        throw new ApiError(
            400,
            "Invalid latitude and longitude coordinates"
        );
    }

    let parsedAccuracy = null;

    if (accuracy_meters !== undefined) {

        parsedAccuracy = Number(
            accuracy_meters
        );

        if (
            isNaN(parsedAccuracy) ||
            parsedAccuracy < 0
        ) {
            throw new ApiError(
                400,
                "Invalid accuracy meters value"
            );
        }
    }

    return {
        lat: parsedLat,
        lng: parsedLng,

        accuracy_meters:
            parsedAccuracy,

        source: allowedSources.includes(source)
            ? source
            : "gps"
    };
};


export default parseAndValidateCoordinates;