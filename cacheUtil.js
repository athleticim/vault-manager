const NodeCache=require('node-cache');
const vaultCache=new NodeCache();

const getSecretValueFromCache=(key)=>{
    return vaultCache.get(key);
}

const setSecretToCache=(key, Value)=>{
    vaultCache.set(key, Value);
}

module.exports={
    getSecretValueFromCache,
    setSecretToCache,
}