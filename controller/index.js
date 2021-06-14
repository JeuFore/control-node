const DEVICE = require('../const/device.js');

module.exports = DeviceController = (mqttClient) => {

    async function setDeviceState(req, res) {
        let { device, state, feature } = req.body;
        if (!device || !state)
            return res.status(400).json({
                type: 'error',
                message: 'Param null, insert device'
            })
        device = DEVICE.find(({ deviceName }) => deviceName === device)
        if (!device)
            return res.status(400).json({
                type: 'error',
                message: 'Device not exist'
            })
        if (feature && !device.features.find(value => value === feature))
            return res.status(400).json({
                type: 'error',
                message: 'Feature not exist'
            })
        mqttClient.publish(`gladys/device/mqtt:${device.deviceRoom}:${device.deviceMQTTName}/feature/mqtt:${device.deviceRoom}:${device.deviceMQTTName}:${feature ? feature : 'state'}/state`, state.toString());
        mqttClient.publish(`gladys/master/device/mqtt:${device.deviceRoom}:${device.deviceMQTTName}/feature/mqtt:${device.deviceRoom}:${device.deviceMQTTName}:${feature ? feature : 'state'}/state`, state.toString());
        return res.json({
            type: 'success',
            message: 'Device state is changed'
        })
    }

    async function getDevices(req, res) {
        const devices = [...DEVICE];
        devices.forEach(device => {
            delete device.deviceParam
            delete device.deviceInstance
            device.children.forEach(async (children) => {
                delete children.deviceParam
                delete children.deviceInstance
            })
        });
        return res.status(200).json({
            type: 'success',
            data: DEVICE
        })
    }

    async function getDevice(req, res) {
        let device = DEVICE.find(({ deviceName, children }) => deviceName === req.query.name || children.find(({ deviceName }) => deviceName === req.query.name))
        if (!device)
            return res.status(400).json({
                type: 'error',
                message: 'Device not exist'
            })
        device = { ...device }
        if (device.deviceInstance.getDeviceState)
            device.state = await device.deviceInstance.getDeviceState()
        delete device.deviceParam
        delete device.deviceInstance
        let childrens = [...device.children]
        device.children = []
        for (let i = 0; i < childrens.length; i++) {
            let children = { ...childrens[i] };
            children.state = await children.deviceInstance.getDeviceState();
            delete children.deviceParam;
            delete children.deviceInstance;
            device.children[i] = children
        }
        return res.status(200).json({
            type: 'success',
            data: device
        })
    }

    return Object.freeze({
        setDeviceState,
        getDevices,
        getDevice
    });
}