import {
    ApiError
} from '#shared';


const validateReviewData = (data) => {
    let { rating = 0, title, body } = data;

    rating = Number(Number(rating).toFixed(1));

    if (
        isNaN(rating) ||
        rating <= 0 ||
        rating > 5
    ) {
        throw new ApiError(
            400,
            "Rating must be in between 0 and 5"
        );
    }

    title = title?.trim() || "";
    body = body?.trim() || "";

    if (!title && !body) {
        throw new ApiError(
            400,
            "Write something in review"
        );
    }

    return {
        rating,
        title,
        body
    };
};


export default validateReviewData;