<h1 align="center">Control-node</h1>

### Control-node is mainly intended to work with the [Gladys](https://github.com/GladysAssistant/Gladys) open source project.

## Getting Started

### With Docker

Using docker compose:

```yaml
version: "3"
services:
  control:
    image: ghcr.io/jeufore/control-node:latest
    container_name: control-node
    privileged: true
    environment: 
      - TOKEN=TOKEN #optional
      - MQTT_HOST=<mqtt_host>
      - MQTT_USER=<mqtt_user>
      - MQTT_PASSWORD=<mqtt_password>
      - Z2M_MQTT_HOST=<z2m_mqtt_host>
      - Z2M_MQTT_USER=<z2m_mqtt_user>
      - Z2M_MQTT_PASSWORD=<z2m_mqtt_password>
    volumes: 
      - ./devices.js:/usr/src/app/const/devices.js
```

or docker run
```bash
docker run -d \
    --privileged \
    --name control-node \
    -e TOKEN=TOKEN \
    -e MQTT_HOST=<mqtt_host>
    -e MQTT_USER=<mqtt_user>
    -e MQTT_PASSWORD=<mqtt_password>
    -e Z2M_MQTT_HOST=<z2m_mqtt_host>
    -e Z2M_MQTT_USER=<z2m_mqtt_user>
    -e Z2M_MQTT_PASSWORD=<z2m_mqtt_password>
    -v ./devices.js:/usr/src/app/const/devices.js \
    ghcr.io/jeufore/control-node:latest
```

Insert **devices.js** in const folder

### For the development

```bash
cd const
nano devices.js

# install dependencies project
npm i

# start project
npm start
```

## .env
| Parameter             | Example value                                     | Description                               |
|-----------------------|---------------------------------------------------|-------------------------------------------|
| TOKEN                 | "KQIBAAKCAgEAz2KJCem7nuff5e4jbXebK9f0L7FZ3"       | Token to use the API # optional           |
| MQTT_HOST             | "mqtt://192.168.1.22:1883"                        | Mqtt host                                 |
| MQTT_USER             | "user"                                            |     Mqtt user                             |
| MQTT_PASSWORD         | "vIaVKkP3wiyy"                                    | Mqtt password                             |
| Z2M_MQTT_HOST         | "mqtt://192.168.1.22:1884"                        | Z2m mqtt host                             |
| Z2M_MQTT_USER         | "user"                                            |     Z2m mqtt user                         |
| Z2M_MQTT_PASSWORD     | "kopaznfze89d"                                    | Z2m Mqtt password                         |
<br/>

## devices.js
```js
const WolDevice = require('../utils/WolDevice'); // If use Wol
const GoveeDevice = require('../utils/GoveeDevice'); // If use Govee
const ArduinoDevice = require('../utils/ArduinoDevice'); // If use Arduino
const VirshController = require('../utils/VirshController'); // If use Virsh
const Zwavejs = require('../utils/Zwavejs');

module.exports = {
    z2m: {
        controller: 'remote',
        lights: [
            'light_1',
            'light_2',
            'light_3'
        ]
    },
    mqtt: [
        {
            deviceName: 'Pc',
            deviceMQTTName: 'pc',
            deviceParam: { mac: '00:00:00:00:00:00', ip: 'your-ip', supportedOff: true, username: 'user', sshKey: '' },
            deviceInstance: WolDevice,
            features: [
                'state'
            ],
            wemore: {
                emulate: true,  // Alexa support
                port: 19834
            },
            interval: 300000,
            children: [
                {
                    deviceName: 'Ubuntu',
                    deviceMQTTName: 'ubuntu',
                    deviceParam: { ip: 'your-ip', name: 'wm-name', username: 'user', sshKey: '' },
                    deviceInstance: VirshController,
                    features: [
                        'state'
                    ],
                    wemore: {
                        emulate: true,  // Alexa support
                        port: 12662
                    },
                    interval: 300000
                }
            ]
        },
        {
            deviceName: 'Strip',
            deviceMQTTName: 'strip',
            deviceParam: { device: '00:00:00:00:00:00:00:00', model: 'H6159', api: '00000000-aaaa-bbbb-cccc-000000000000' },
            deviceInstance: GoveeDevice,
            useInZ2m: true, // use this inside z2m action
            features: [
                'state',
                'brightness',
                'color',
                'temp'
            ],
            wemore: {
                emulate: false
            },
            children: []
        },
        {
            deviceName: 'Power plug',
            deviceMQTTName: 'power plug',
            deviceParam: { path: '/dev/cu.usbmodem14201', data_pin: 8, code: { on: 1381717, off: 1381716 }, name: 'Power plug' },
            deviceInstance: ArduinoDevice,
            features: [
                'state',
                'timer'
            ],
            wemore: {
                emulate: true,  // Alexa support
                port: 18495
            },
            children: []
        },
        {
            deviceName: 'FGMS001',
            deviceMQTTName: 'fgms001',
            deviceParam: { deviceName: 'FGMS001' },
            deviceInstance: Zwavejs,
            features: [
                'motion',
                'temperature',
                'luminance',
                'battery'
            ],
            sensor: true
        }
    ]
}
```