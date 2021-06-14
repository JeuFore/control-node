const axios = require('axios').default

class ArduinoDevice {
    constructor({ arduino, data_pin, code, name }) {
        this.arduino = arduino;
        this.jsonMessage = {
            function_name: 'emit_433',
            parameters: {
                bit_length: 24,
                data_pin,
                code: 0
            }
        }
        this.on = code.on;
        this.off = code.off
        this.timerNumber;
        this.name = name
    }

    async setState(state) {
        if (state != 1 && state != 0)
            return `The state is not correct. Use 'on' or 'off'`;
        if (state == 1)
            return this.setOn();
        this.setOff();
    }

    async setOn() {
        this.jsonMessage.parameters.code = this.on
        return this.send();
    }

    async setOff() {
        this.jsonMessage.parameters.code = this.off
        return this.send();
    }

    async setTimer(time) {
        if (!time || time < 0 || time > 1440)
            return `The timer is not correct. The timer is between 0 and 1440`;
        if (this.timerNumber)
            clearInterval(this.timerNumber)
        if (time != 0) {
            axios({
                method: 'POST',
                url: 'http://127.0.0.1:2468/api/v1/device',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.TOKEN
                },
                data: {
                    device: this.name,
                    state: '1'
                }
            })
            this.timerNumber = setTimeout(() => {
                return axios({
                    method: 'POST',
                    url: 'http://127.0.0.1:2468/api/v1/device',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': process.env.TOKEN
                    },
                    data: {
                        device: this.name,
                        state: '0'
                    }
                })
            }, time * 60000)
        }
    }

    /**
     * Fonction qui envoie un message à l'arduino
     * 
     * @param {*} message message qui doit être envoyé à l'arduino
     */
    send() {
        this.arduino.write(`${JSON.stringify(this.jsonMessage)}%`);
    }
}

module.exports = ArduinoDevice;