const hasEmpty = (arr = []) => {
    return arr.some((value) => {
        return (
            value === undefined ||
            value === null ||
            value === ""
        );
    });
};

// read about this 
const isValidUUID = (value = "") => {
    if(typeof value !== "string"){
        return false;
    }

    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return uuidRegex.test(
        value.trim()
    );
};


export {
    hasEmpty,
    isValidUUID
};