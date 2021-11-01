function intToRgb(intColor) {
    // eslint-disable-next-line no-bitwise
    const red = intColor >> 16;
    // eslint-disable-next-line no-bitwise
    const green = (intColor - (red << 16)) >> 8;
    // eslint-disable-next-line no-bitwise
    const blue = intColor - (red << 16) - (green << 8);

    return {
        red,
        green,
        blue
    }
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    let alphaFromHex;
    if (hex.length === 8) {
        alphaFromHex = Number.parseInt(hex.slice(6, 8), 16) / 255;
        hex = hex.slice(0, 6);
    }
    const number = Number.parseInt(hex, 16);
    return {
        red: number >> 16,
        green: (number >> 8) & 255,
        blue: number & 255
    }
}

module.exports = {
    intToRgb,
    hexToRgb
}