function randomHexColorCode() {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
};

function randomIntColorCode() {
    return Math.floor(Math.random() * 16777215);
};

module.exports = {
    randomHexColorCode,
    randomIntColorCode
}