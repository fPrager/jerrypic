module.exports = (name, isRequestParam) => {
    const type = `${isRequestParam ? 'Request' : ''} Parameter`;
    if (name) {
        throw new Error(`${type} '${name}' is required parameter but missing.`);
    } else {
        throw new Error(`Some ${type} is missing.`);
    }
};
