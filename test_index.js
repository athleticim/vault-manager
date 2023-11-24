const dummyEnv = {};
const getDummyValue = async (keyName) => {
    return dummyEnv[keyName];
}

const setDummyEnv = async (key, Value) => {
    return dummyEnv[key] = Value;
}
const getWriteMongoUri = async (dbName) => {
    return dummyEnv[dbName];
}

module.exports = {
    getDummyValue,
    setDummyEnv,
    getWriteMongoUri
}