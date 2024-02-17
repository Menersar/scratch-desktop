const ws281x = require('@simontaga/rpi-ws281x-native/lib/ws281x-native');

const ws281xNumLEDs = parseInt(process.argv[2], 10);
const ws281xNumStartLEDs = parseInt(process.argv[3], 10);
const ws281xNumEndLEDs = parseInt(process.argv[4], 10);
const ws281xColorLEDsString = process.argv[5].toString();

const ws281xOptionsDma = parseInt(process.argv[6], 10);
const ws281xOptionsFreq = parseInt(process.argv[7], 10);
const ws281xOptionsGpio = parseInt(process.argv[8], 10);
const ws281xOptionsInvertString = process.argv[9].toString();
const ws281xOptionsBrightness = parseInt(process.argv[10], 10);
const ws281xOptionsStripType = process.argv[11].toString();


function hex2Decimal(hex) {
    return parseInt(hex, 16);
}

// class ControlWS281X {
// static ws281xInitColorRender(ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xOptionsDma, ws281xOptionsFreq, ws281xOptionsGpio, ws281xOptionsInvert, ws281xOptionsBrightness, ws281xOptionsStripType) {

const hexColorShort = ws281xColorLEDsString.slice(1);
const ws281xColorLEDs = hex2Decimal(hexColorShort);

let ws281xOptionsInvert = false;
if (ws281xOptionsInvertString == 'true') {
    ws281xOptionsInvert = true;
} else {
    ws281xOptionsInvert = false;
}

const ws281xOptions = {
    dma: ws281xOptionsDma,
    freq: ws281xOptionsFreq,
    gpio: ws281xOptionsGpio,
    invert: ws281xOptionsInvert,
    brightness: ws281xOptionsBrightness,
    stripType: ws281xOptionsStripType
};
const channel = ws281x(ws281xNumLEDs, ws281xOptions);

const pixelData = channel.array;

let iterator = ws281xNumLEDs;
while (iterator--) {
    pixelData[iterator] = 0;
}

for (let i = ws281xNumStartLEDs; i <= ws281xNumEndLEDs; i++) {
    pixelData[i] = ws281xColorLEDs;
}

ws281x.render();
// }
// }

// module.exports = ControlWS281X;
