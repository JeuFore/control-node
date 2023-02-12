let { mqtt } = require('../const/devices.js');
const wemore = require('wemore');

let createDevice = {};

module.exports = (mqttClient) => {
    mqtt.forEach(device => {
        device.deviceInstance = new device.deviceInstance(device.deviceParam)
        if (device.features)
            device.features.forEach(feature => {
                if (device.sensor) {
                    const topic = device.deviceInstance.getSubscribedTopic(feature);
                    mqttClient.subscribe(topic);
                    createDevice[topic] = {
                        deviceInstance: device.deviceInstance,
                        method: `get${feature.charAt(0).toUpperCase() + feature.slice(1)}`,
                        sensor: true,
                        deviceMQTTName: device.deviceMQTTName,
                        feature
                    }
                }
                else {
                    mqttClient.subscribe(`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:${feature}/state`)
                    createDevice[`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:${feature}/state`] = {
                        deviceInstance: device.deviceInstance,
                        method: `set${feature.charAt(0).toUpperCase() + feature.slice(1)}`
                    }
                }
            });
        if (device.wemore?.emulate) {
            const wemoreDevice = wemore.Emulate({ friendlyName: device.deviceName, port: device.wemore.port });
            wemoreDevice.on('state', (binaryState) => {
                mqttClient.publish(`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:state/state`, binaryState.toString());
                mqttClient.publish(`gladys/master/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:state/state`, binaryState.toString());
            })
        }
        if (device.interval)
            setDeviceInterval(device, mqttClient)
        if (device.children)
            device.children.forEach(children => {
                children.deviceInstance = new children.deviceInstance(children.deviceParam)
                if (children.features)
                    children.features.forEach(feature => {
                        mqttClient.subscribe(`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${children.deviceMQTTName}:${feature}/state`)
                        createDevice[`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${children.deviceMQTTName}:${feature}/state`] = {
                            deviceInstance: children.deviceInstance,
                            method: `set${feature.charAt(0).toUpperCase() + feature.slice(1)}`
                        }
                    });
                if (children.wemore.emulate) {
                    const wemoreDevice = wemore.Emulate({ friendlyName: children.deviceName, port: children.wemore.port });
                    wemoreDevice.on('state', (binaryState) => {
                        mqttClient.publish(`gladys/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${children.deviceMQTTName}:state/state`, binaryState.toString());
                        mqttClient.publish(`gladys/master/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${children.deviceMQTTName}:state/state`, binaryState.toString());
                    })
                }
            })
    });
    mqttClient.on('message', async (topic, message) => {
        const device = createDevice[topic];
        if (device)
            if (device.sensor) {
                const value = device.deviceInstance[device.method](JSON.parse(message.toString()));
                mqttClient.publish(`gladys/master/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:${device.feature}/state`, value.toString());
            }
            else
                device.deviceInstance[device.method](message.toString());
    })
}

async function setDeviceInterval(device, mqttClient) {
    setInterval(async () => {
        const state = await device.deviceInstance.getDeviceState() ? 1 : 0
        mqttClient.publish(`gladys/master/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${device.deviceMQTTName}:state/state`, state.toString());
    }, device.interval)
    device.children.forEach(children => {
        setInterval(async () => {
            const state = await children.deviceInstance.getDeviceState() ? 1 : 0
            mqttClient.publish(`gladys/master/device/mqtt:${device.deviceMQTTName}/feature/mqtt:${children.deviceMQTTName}:state/state`, state.toString());
        }, children.interval)
    })
}