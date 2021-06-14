var GoveeDevice = require('./GoveeDevice')
var { httpRequest } = require('./httpRequest')

function connect(config) {
    return new GoveeDevice(config.device, config.model, config.apiKey);
}

function ping() {
    return httpRequest('https://developer-api.govee.com/ping', 'GET');
}

async function getDevices(apiKey) {
    if (!apiKey)
        return 'Insert api-key please :)';
    return (await httpRequest('https://developer-api.govee.com/v1/devices', 'GET', { apiKey })).data;
}

module.exports = {
    connect,
    ping,
    getDevices,
}