const DeviceController = require('../controller/index');

module.exports = (app, mqttClient, checkValidToken) => {
    const deviceController = DeviceController(mqttClient);
    app.post('/device', checkValidToken, deviceController.setDeviceState);
    app.get('/device', checkValidToken, deviceController.getDevice);
    app.get('/devices', checkValidToken, deviceController.getDevices);
};