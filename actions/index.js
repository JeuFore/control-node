const z2m = require('./z2m');
const subscribe = require('./subscribe');

module.exports = (mqttClient, z2mClient) => {
    subscribe(mqttClient);
    z2m(mqttClient, z2mClient);
}