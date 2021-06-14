var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { checkValidToken } = require('./middleware/token');
const { subscribe } = require('./controller/subscribe');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
require('dotenv').config();

const mqtt = require('mqtt');
var client = mqtt.connect(process.env.MQTT_HOST, { username: process.env.MQTT_USER, password: process.env.MQTT_PASSWORD });
setTimeout(() => {
    if (!client.connected)
        throw new Error('Le client MQTT ne parvient pas à se connecter');
}, 5000);

subscribe(client);

const router = express.Router();
app.use('/api/v1', router);
require('./routes/index')(router, client, checkValidToken);

module.exports = app;