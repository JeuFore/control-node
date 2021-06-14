var { hexToRgb, intToRgb } = require('./colorConverter');
var { httpRequest } = require('./httpRequest');

class GoveeDevice {
    constructor({ device, model, api }) {
        this.data = {
            body: {
                device,
                model,
                cmd: {},
            },
            apiKey: api
        };
    }

    async setState(state) {
        if (state != 1 && state != 0)
            return `The state is not correct. Use 'on' or 'off'`;
        if (state == 1)
            return this.setOn()
        return this.setOff();
    }

    async setOn() {
        this.data.body.cmd = {
            name: 'turn',
            value: 'on'
        }
        return (await httpRequest('https://developer-api.govee.com/v1/devices/control', 'PUT', this.data)).message;
    }

    async setOff() {
        this.data.body.cmd = {
            name: 'turn',
            value: 'off'
        }
        return (await httpRequest('https://developer-api.govee.com/v1/devices/control', 'PUT', this.data)).message;
    }

    async setBrightness(brightness) {
        if (!brightness || brightness < 0 || brightness > 100)
            return `The brightness is not correct. The brightness is between 0 and 100`;
        this.data.body.cmd = {
            name: 'brightness',
            value: parseInt(brightness)
        }
        return (await httpRequest('https://developer-api.govee.com/v1/devices/control', 'PUT', this.data)).message;
    }

    async setColor(color) {
        if (!color)
            return `The color is not correct. Please enter HEX color or color = {r, g, b}`;
        if (color.type)
            switch (color.type) {
                case 'hex':
                    color = hexToRgb(color.data)
                    break;
                case 'int':
                    color = intToRgb(color.data)
                    break;
                default:
                    break;
            }
        if (typeof color === 'string')
            color = intToRgb(parseInt(color))

        this.data.body.cmd = {
            name: 'color',
            value: {
                r: color.red || 0,
                g: color.green || 0,
                b: color.blue || 0
            }
        }
        return (await httpRequest('https://developer-api.govee.com/v1/devices/control', 'PUT', this.data)).message;
    }

    async setTemp(colorTem) {
        if (!colorTem || colorTem < 2000 || colorTem > 9000)
            return `The color temperature is not correct. The color temperature is between 2000 and 9000`;
        this.data.body.cmd = {
            name: 'colorTem',
            value: parseInt(colorTem)
        }
        return (await httpRequest('https://developer-api.govee.com/v1/devices/control', 'PUT', this.data)).message;
    }

    async getDeviceState() {
        return (await httpRequest(`https://developer-api.govee.com/v1/devices/state?device=${this.data.body.device}&model=${this.data.body.model}`, 'GET', this.data)).data.properties[1].powerstate === 'on' ? true : false;
    }

}

module.exports = GoveeDevice