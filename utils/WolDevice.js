const wol = require('wol');
const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH();
const ping = require('ping');

class WolDevice {
    constructor({ mac, ip, supportedOff, username }) {
        this.mac = mac;
        this.ip = ip;
        this.username = username;
        this.supportedOff = supportedOff;
    }

    async setState(state) {
        if (state != 1 && state != 0)
            return `The state is not correct. Use 'on' or 'off'`;
        if (state == 1)
            return this.setOn();
        this.setOff();
    }

    async setOn() {
        return wol.wake(this.mac)
    }

    async setOff() {
        if (this.supportedOff) {
            try {
                await ssh.connect({
                    host: this.ip,
                    username: this.username,
                    privateKey: process.env.PRIVATE_KEY_PATH
                })
                await ssh.execCommand('sudo /sbin/shutdown -h now')
                ssh.dispose()
            } catch (e) {
            }
        }
    }

    async getDeviceState() {
        return (await ping.promise.probe(this.ip)).alive;
    }
}

module.exports = WolDevice;