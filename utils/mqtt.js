const mqtt = require('mqtt');

module.exports = (host, options) => {
    const client = mqtt.connect(host, options);
    setTimeout(() => {
        if (!client.connected)
            throw new Error(`Le client ${host} ne parvient pas à se connecter`);
        else
            console.info(`Client ${host} connecté`);
    }, 5000);
    return client;
}