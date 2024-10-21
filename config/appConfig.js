const { AppConfigurationClient } = require('@azure/app-configuration')

// Initialize App Configuration client
const appConfigClient = new AppConfigurationClient(
    process.env.APP_CONFIG_CONNECTION_STRING
)

// Function to save the access token in Azure App Configuration
async function saveAccessToken(token) {
    await appConfigClient.setConfigurationSetting({
        key: 'KiteConnectAccessToken',
        value: token,
    })
}

// Function to get the access token from Azure App Configuration
async function getAccessToken() {
    const configSetting = await appConfigClient.getConfigurationSetting({
        key: 'KiteConnectAccessToken',
    })
    return configSetting.value
}

module.exports = { saveAccessToken, getAccessToken }
