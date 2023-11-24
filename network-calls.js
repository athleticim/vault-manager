const { ClientSecretCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { getSecretValue } = require('@athleticim/config-manager');
const { getConfigValueByKey } = require('@athleticim/config-manager/getConfig');


const initValutObj = async (hostName) => {
    const tenantId = await getConfigValueByKey('tenantId' , hostName);
    const clientId = await getConfigValueByKey('clientId', hostName);
    const vaultName = await getConfigValueByKey('vaultName', hostName);
    const credential = new ClientSecretCredential(
        tenantId,
        clientId,
        'dF88Q~-2CoyhSXxky-cwSWCxns_AsIa8cxoEtcaQ'
    );
    const clientOptions = {
        retryOptions: {
            maxRetries: 0,
            retryDelayInMs: 0
        },
        retryOptions: {
            timeout: 10000,
        }
    }
    return new SecretClient(`https://${vaultName}.vault.azure.net`, credential, clientOptions);
}




const getSecretValueFromAure = async (keyName , hostName) => {
    try {
        const client = await initValutObj(hostName);
        const value= await client.getSecret(keyName);
        return value;
    } catch (error) {
        return null;
    }
}

module.expors = {
    getSecretValueFromAure,
}
