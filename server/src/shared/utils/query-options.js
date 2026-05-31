// utils/queryOptions.js

const getQueryOptions = (query = {}) => {
    let {
        page = 1,
        limit = 10,
        filter = null,
        sortBy = null,
        sortType = null
    } = query;

    limit = Math.min(
        Math.max(Number(limit) || 10, 1),
        25
    );

    page = Math.max(
        Number(page) || 1,
        1
    );

    sortType =
        String(sortType).toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

    const allowedSort = [
        "created_at",
        "title",
        "category"
    ];

    sortBy =
        allowedSort.includes(
            sortBy
        )
        ? sortBy
        : "created_at";

    return {
        page,
        limit,
        filter,
        sortBy,
        sortType
    };
};


export default getQueryOptions;