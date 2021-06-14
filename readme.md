# Control-node

docker run
```bash
docker run -d \
--privileged \
--network=host \
--name control-node \
-e PRIVATE_KEY_PATH=SSH_PATH \
-e TOKEN=TOKEN \
-e MQTT_HOST=HOST \
-e MQTT_USER=USER \
-e MQTT_PASSWORD=PASSWORD \
-v /dev:/dev \
-v ~/.ssh:/root/.ssh \
-v ./device.js:/usr/src/app/const/device.js \
jeufore/control-node
```

docker-compose.yml
```bash
version: "3"
services:
  control:
    image: jeufore/control-node
    container_name: control-node
    network_mode: host
    privileged: true
    environment: 
      - PRIVATE_KEY_PATH=SSH_PATH #optional
      - TOKEN=TOKEN #optional
      - MQTT_HOST=HOST
      - MQTT_USER=USER
      - MQTT_PASSWORD=PASSWORD
    volumes: 
      - /dev:/dev #optional
      - ./device.js:/usr/src/app/const/device.js
      - ~/.ssh:/root/.ssh #optional
```

Insert **device.js** in const folder

```bash
cd const
nano device.js

# install dependencies project
npm i

# start project
npm start
```

## .env
| Parameter             | Example value                                 | Description                                |
|-----------------------|--------------------------------------------------|--------------------------------------------|
| PRIVATE_KEY_PATH              | "/Users/user/.ssh/id_rsa" | Used for shutting down a computer in ssh #optional                              |
| TOKEN         | "KQIBAAKCAgEAz2KJCem7nuff5e4jbXebK9f0L7FZ3"               | Token to use the API # optional                         |
| MQTT_HOST             | "mqtt://192.168.1.2"                   | Mqtt host                     |
| MQTT_USER              | "user"                                         |     Mqtt user                 |
| MQTT_PASSWORD              | "vIaVKkP3wiyy"           | Mqtt password        |
<br/>

## device.js
```js
const WolDevice = require('../utils/WolDevice'); // If use Wol
const GoveeDevice = require('../utils/GoveeDevice'); // If use Govee
const ArduinoDevice = require('../utils/ArduinoDevice'); // If use Arduino
const VirshController = require('../utils/VirshController'); // If use Virsh

const SerialPort = require('serialport') // If use Arduino
const Arduino = new SerialPort("/dev/cu.usbmodem14201", { baudRate: 9600, lock: false }) // If use Arduino

module.exports = [
    {
        deviceName: 'Pc',
        deviceMQTTName: 'pc',
        deviceRoom: 'server',
        deviceParam: { mac: '00:00:00:00:00:00', ip: 'your-ip', supportedOff: true, username: 'user' },
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
                deviceName: 'Windows',
                deviceMQTTName: 'windows',
                deviceRoom: 'server',
                deviceParam: { ip: 'your-ip', name: 'wm-name', username: 'user' },
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
        deviceRoom: 'room',
        deviceParam: { device: '00:00:00:00:00:00:00:00', model: 'H6159', api: '00000000-aaaa-bbbb-cccc-000000000000' },
        deviceInstance: GoveeDevice,
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
        deviceRoom: 'room',
        deviceParam: { arduino: Arduino, data_pin: 8, code: { on: 1381717, off: 1381716 }, name: 'Power plug' },
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
    }
]
```