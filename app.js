require('dotenv').config();
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const app = express();

const checkValidToken = require('./middleware/token');

const mqtt = require('./utils/mqtt');
const actions = require('./actions');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const mqttClient = mqtt(process.env.MQTT_HOST, { username: process.env.MQTT_USER, password: process.env.MQTT_PASSWORD });

const z2mClient = mqtt(process.env.MQTT_HOST_Z2M, { username: process.env.MQTT_USER_Z2M, password: process.env.MQTT_PASSWORD_Z2M });

actions(mqttClient, z2mClient);

const router = express.Router();
app.use('/api/v1', router);
router.get('/healthz', (req, res) => {
    const code = mqttClient.connected && z2mClient.connected ? 200 : 500;
    return res.status(code).send(mqttClient.connected && z2mClient.connected ? 'OK' : 'NOT OK')
});
require('./routes/index')(router, mqttClient, checkValidToken);

module.exports = app;