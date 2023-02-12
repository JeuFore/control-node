const zwaveCommand = require('../const/zwaveCommand');

class Zwavejs {
    constructor({ deviceName }) {
        this.deviceName = deviceName;
    }

    getSubscribedTopic(feature) {
        const zwaveFeature = zwaveCommand[feature];
        return `zwave2mqtt/${this.deviceName}/${zwaveFeature}`
    }

    getMotion({ value }) {
        return value ? 1 : 0;
    }

    getTemperature({ value }) {
        return value
    }

    getLuminance({ value }) {
        return value
    }

    getBattery({ value }) {
        return value
    }
}

module.exports = Zwavejs;