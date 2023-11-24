const { getSecretValueFromAure } = require('./network-calls');
const {
    getSecretValueFromCache,
    setSecretToCache } = require('./cacheUtil');
const { getConfigValueByKey, checkAzureKey } = require('@athleticim/config-manager/getConfig');
const Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();

const getHostName = (hostUrl) => {
    const parsedUrl = new URL(hostUrl);
    return parsedUrl.hostname;
}

const getDefaultSecretValue = async (keyName) => {
    const replace = new RegExp('_', 'g');
    const fetchKeyName = keyName.replace(replace, '-');
    return getKeyFromCache(fetchKeyName, keyName, keyName);
}

const getConfigSpecificSecretValue = async (keyName, region) => {
    const configSpecific = await getConfigValueByKey(region);
    const prefixAddedName = constructKey(keyName, configSpecific);
    return await getKeyFromCache(prefixAddedName, keyName, `${configSpecific}-${keyName}`);
}

const getSecretValue = async (keyName) => {
    const hostName = getHostName(process.env.hostUrl);
    const vaultKeyName = constructKey(keyName, hostName.split('.')[0]);
    return await getKeyFromCache(vaultKeyName, keyName, `${hostName.split('.')[0]}-${keyName}`);
}

const getEnv = (keyName) => {
    if (process.env[keyName] != undefined) {
        return process.env[keyName];
    }
    return undefined;
}

const replacePass = (MongoUri, Passsword) => {
    const replacer = new RegExp('%p', 'g');
    MongoUri = MongoUri.replace(replacer, Passsword);
    return MongoUri;
}

const getKeyFromCache = async (vaultKeyName, keyName, configKeyName) => {
    if (process.env.gitToken) {
        return getEnv(keyName);
    }
    if (await checkAzureKey(configKeyName)) {
        mutex.acquire();
        const value = getSecretValueFromCache(vaultKeyName);
        if (value == undefined) {
            const result = await getAzureVaultKeyAndSet(vaultKeyName);
            mutex.release();
            return result;
        }
        mutex.release();
        return value;
    }
    return getEnv(keyName);
}

const getMongoUri = async (dbConfigName) => {
    const MongoUri = await getConfigValueByKey(dbConfigName);
    const dbPassword = await getSecretValue(`${dbConfigName}-password`);
    return replacePass(MongoUri, dbPassword);
}
const getAzureVaultKeyAndSet = async (keyName) => {
    const result = await getSecretValueFromAure(keyName);
    setSecretToCache(result.name, result.value);
    return result.value;
}

if (process.env.AZURE_NODE_ENV != 'development') {
    module.exports = {
        getSecretValue,
        getDefaultSecretValue,
        getConfigSpecificSecretValue,
        getMongoUri
    }
} else {
    const { getDummyValue, setDummyEnv, } = require('./test_index');
    module.exports = {
        getSecretValue: getDummyValue,
        setKey: setDummyEnv,
        getDefaultSecretValue: getDummyValue,
        getConfigSpecificSecretValue: getDummyValue,
        getMongoUri:getDummyValue,
    }
}
