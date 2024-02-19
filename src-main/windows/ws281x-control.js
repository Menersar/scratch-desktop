if (process.platform === "linux") {

    const ws281x = require('@simontaga/rpi-ws281x-native/lib/ws281x-native');





    var args = {
        START: 1,
        END: 5,
        COLOR: '#000000',
    }

    const ledStart = args.START;
    const ledEnd = args.END;
    const hexColor = (args.COLOR ?? '').toString() || '#000000';

    const NUM_LEDS = 7;
    const GPIO = 18;
    // const COLOR = rgb2Int(255, 0, 0);
    const DMA = 10;
    const FREQUENCY = 800000;
    const INVERT = false;
    const BRIGHTNESS = 125;
    const STRIP_TYPE = 'ws2812';

    var options = {
        dma: DMA,
        freq: FREQUENCY,
        gpio: GPIO,
        invert: INVERT,
        brightness: BRIGHTNESS,
        stripType: STRIP_TYPE
    };

    const ledStartIndex = ledStart - 1;
    const ledEndIndex = ledEnd - 1;






    // const ws281xNumLEDs = parseInt(process.argv[2], 10);
    // const ws281xNumStartLEDs = parseInt(process.argv[3], 10);
    // const ws281xNumEndLEDs = parseInt(process.argv[4], 10);
    // const ws281xColorLEDsString = process.argv[5].toString();

    // const ws281xOptionsDma = parseInt(process.argv[6], 10);
    // const ws281xOptionsFreq = parseInt(process.argv[7], 10);
    // const ws281xOptionsGpio = parseInt(process.argv[8], 10);
    // const ws281xOptionsInvertString = process.argv[9].toString();
    // const ws281xOptionsBrightness = parseInt(process.argv[10], 10);
    // const ws281xOptionsStripType = process.argv[11].toString();






    const ws281xNumLEDs = parseInt(process.argv[2], 10) || NUM_LEDS;
    // console.log(ws281xNumLEDs);
    const ws281xNumStartLEDs = parseInt(process.argv[3], 10) || ledStartIndex;
    // console.log(ws281xNumStartLEDs);
    const ws281xNumEndLEDs = parseInt(process.argv[4], 10) || ledEndIndex;
    // console.log(ws281xNumEndLEDs);
    const ws281xColorLEDsString = (process.argv[5] ?? '').toString() || hexColor;
    // console.log(ws281xColorLEDsString);

    const ws281xOptionsDma = parseInt(process.argv[6], 10) || DMA;
    // console.log(ws281xOptionsDma);
    const ws281xOptionsFreq = parseInt(process.argv[7], 10) || FREQUENCY;
    // console.log(ws281xOptionsFreq);
    const ws281xOptionsGpio = parseInt(process.argv[8], 10) || GPIO;
    // console.log(ws281xOptionsGpio);
    const ws281xOptionsInvertString = (process.argv[9] ?? '').toString() || INVERT;
    // console.log(ws281xOptionsInvertString);

    const ws281xOptionsBrightness = parseInt(process.argv[10], 10) || BRIGHTNESS;
    // console.log(ws281xOptionsBrightness);
    const ws281xOptionsStripType = (process.argv[11] ?? '').toString() || STRIP_TYPE;
    // console.log(ws281xOptionsStripType);










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

    function hex2Decimal(hex) {
        return parseInt(hex, 16);
    }


}