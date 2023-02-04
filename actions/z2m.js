const { z2m, mqtt } = require('../const/devices.js');

const { randomHexColorCode, randomIntColorCode } = require('../utils/colorRandomizer');

module.exports = (mqttClient, z2mClient) => {
    if(!z2m.controller){
        console.info('No controller defined, skipping z2m actions');
        return;
    }

    const publishMqttLights = (device, values) => {
        Object.entries(values).forEach(([feature, value]) => {
            if (!device.features.find((featureName) => featureName === feature))
                return;
            if (feature === 'state')
                value = value === 'ON' ? 1 : 0;
            if (feature === 'brightness')
                value = Math.round(value / 2.55);
            mqttClient.publish(`gladys/device/mqtt:${device.name}/feature/mqtt:${device.name}:${feature}/state`, value.toString());
            mqttClient.publish(`gladys/master/device/mqtt:${device.name}/feature/mqtt:${device.name}:${feature}/state`, value.toString());
        })
    };

    let last_value = {};

    const lights = [...z2m.lights];

    const mqttLights = [];
    mqtt.forEach(device => {
        if (device.useInZ2m)
            mqttLights.push({
                name: device.deviceMQTTName,
                features: device.features
            });
    });

    let selected_devices;

    z2mClient.subscribe(`zigbee2mqtt/${z2m.controller}`)

    z2mClient.on('message', async (topic, message) => {
        if (topic === `zigbee2mqtt/${z2m.controller}`) {
            const value = JSON.parse(message.toString())
            let send_value = {}
            switch (value.action) {
                case 'on-press':
                    if (value.counter >= 2) {
                        send_value.effect = 'okay'
                        if (!selected_devices)
                            selected_devices = { index: 0, name: lights[0] }
                        else {
                            if (selected_devices.index === lights.length - 1) {
                                send_value.effect = 'blink'
                                selected_devices = undefined
                            }
                            else
                                selected_devices = { index: selected_devices.index + 1, name: lights[selected_devices.index + 1] }
                        }
                    }
                    else
                        send_value.state = 'ON'
                    break;
                case 'off-press':
                    if (value.counter >= 2) {
                        send_value.effect = 'okay'
                        if (!selected_devices)
                            selected_devices = { index: 0, name: lights[0] }
                        else
                            if (selected_devices.index === lights.length - 1) {
                                send_value.effect = 'blink'
                                selected_devices = undefined
                            }
                            else
                                selected_devices = { index: selected_devices.index + 1, name: lights[selected_devices.index + 1] }
                    }
                    else
                        send_value.state = 'OFF'
                    break;
                case 'on-hold':
                    send_value.state = 'ON'
                    selected_devices = undefined
                    break;
                case 'off-hold':
                    send_value.state = 'OFF'
                    selected_devices = undefined
                    break;
                case 'up-press':
                    if (value.counter === 2) {
                        send_value.color = { hex: random_hex_color_code() }
                        break;
                    }
                case 'down-press':
                    if (value.counter === 2) {
                        send_value.randomColor = true
                        break;
                    }
                default:
                    if (value.brightness !== last_value.brightness)
                        send_value.brightness = value.brightness
                    break;
            }
            if (!selected_devices) {
                if (send_value.randomColor) {
                    mqttLights.forEach(light => publishMqttLights(light, { color: randomIntColorCode() }))
                    lights.forEach(light => z2mClient.publish(`zigbee2mqtt/${light}/set`, JSON.stringify({ color: { hex: randomHexColorCode() } })))
                }
                else {
                    mqttLights.forEach(light => publishMqttLights(light, send_value))
                    lights.forEach(light => z2mClient.publish(`zigbee2mqtt/${light}/set`, JSON.stringify(send_value)))
                }
            }
            else
                if (Array.isArray(selected_devices.name))
                    selected_devices.name.forEach(light => z2mClient.publish(`zigbee2mqtt/${light}/set`, JSON.stringify(send_value)))
                else
                    z2mClient.publish(`zigbee2mqtt/${selected_devices.name}/set`, JSON.stringify(send_value))

            last_value = value
        }
    })
}