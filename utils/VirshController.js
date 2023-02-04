const { NodeSSH } = require('node-ssh')
const ssh = new NodeSSH();

class VirshController {
    constructor({ ip, name, username, sshKey }) {
        this.ip = ip;
        this.name = name;
        this.username = username;
        this.sshKey = sshKey;
    }

    async setState(state) {
        if (state != 1 && state != 0)
            return `The state is not correct. Use 'on' or 'off'`;
        if (state == 1)
            return this.setOn();
        this.setOff();
    }

    async setOn() {
        try {
            await ssh.connect({
                host: this.ip,
                username: this.username,
                privateKey: this.sshKey
            })

            await ssh.execCommand(`sudo virsh start ${this.name}`)
            ssh.dispose()
        } catch (e) {
        }
    }

    async setOff() {
        try {
            await ssh.connect({
                host: this.ip,
                username: this.username,
                privateKey: this.sshKey
            })

            await ssh.execCommand(`sudo virsh shutdown ${this.name} --mode acpi`)
            ssh.dispose()
        } catch (e) {
        }
    }

    async getDeviceState() {
        try {
            await ssh.connect({
                host: this.ip,
                username: this.username,
                privateKey: this.sshKey
            })

            const { stdout } = await ssh.execCommand(`sudo virsh domstate ${this.name}`)
            ssh.dispose()
            return stdout === 'running'
        } catch (e) {
            return false
        }
    }
}

module.exports = VirshController;