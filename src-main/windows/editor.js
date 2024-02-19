var _ = require('lodash');
// const fs = require("fs");
// const { promisify } = require("util");
const fsPromises = require("fs/promises");
const path = require("path");
const { app, dialog } = require("electron");
const ProjectRunningWindow = require("./project-running-window");
const AddonsWindow = require("./addons");
const DesktopSettingsWindow = require("./desktop-settings");
const PrivacyWindow = require("./privacy");
const AboutWindow = require("./about");
const PackagerWindow = require("./packager");
const { createAtomicWriteStream } = require("../atomic-write-stream");
const { translate, updateLocale, getStrings } = require("../l10n");
const { APP_NAME } = require("../brand");
const prompts = require("../prompts");
const settings = require("../settings");
// const privilegedFetchAsBuffer = require("../fetch");
const privilegedFetch = require("../fetch");
// const rebuildMenuBar = require("../menu-bar");

// const ws281x1 = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');
// const ws281x = require("rpi-ws281x-native");
const sudoJS = require('sudo-js');
// const ControlWS281X = require('./ws281x-control');

// const bleno = require("bleno");
// var ws281x = require('rpi-ws281x-native/lib/ws281x-native');

// const ws281x1 = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');
// const ws281x = require("rpi-ws281x-native");
// const ws281x = require("@simontaga/rpi-ws281x-native/lib/ws281x-native");
const nodeChildProcess = require('child_process');



// class LEDBrightnessCharacteristic extends bleno.Characteristic {
//   constructor(uuid, name) {
//     super({
//       uuid: uuid,
//       properties: ["read", "write"],
//       value: null,
//       descriptors: [
//         new bleno.Descriptor({
//           uuid: "2901",
//           value: name
//         })
//       ]
//     });
//     this.argument = 0;
//     this.name = name;
//   }
//   onWriteRequest(data, offset, withoutResponse, callback) {
//     try {
//       if (data.length == 0) {
//         callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
//         return;
//       }
//       console.log(`raw data ${data}`);
//       this.argument = data;
//       ws281x.setBrightness(parseInt(data));
//       console.log(`LED Brightness ${this.name} is now ${this.argument}`);

//       callback(this.RESULT_SUCCESS);
//     } catch (err) {
//       console.error(err);
//       callback(this.RESULT_UNLIKELY_ERROR);
//     }
//   }
//   onReadRequest(offset, callback) {
//     try {
//       const result = 255;
//       console.log(`LEDBrightnessCharacteristic result: ${result}`);
//       let data = new Buffer(1);
//       data.writeUInt8(result, 0);
//       callback(this.RESULT_SUCCESS, data);
//     } catch (err) {
//       console.error(err);
//       callback(this.RESULT_UNLIKELY_ERROR);
//     }
//   }
// }






// // const ws281x2 = require("../static/rpi-ws281x-native/lib/ws281x-native");
// const ws281x = require('node-rpi-ws281x-native-2');

// const readFile = promisify(fs.readFile);
// const gpio = require("ModuleGpiolib");

// if (process.platform === "linux") {
//   console.log("platform is linux");
//   //   const gpiolib = require("gpiolib.node");
//   const gpio = require("../../../static/gpiolib.node");
//   require("../static/gpiolib.node");
// }

// const gpio = require(process.resourcesPath + "/static/gpiolib.node");

const TYPE_FILE = "file";
const TYPE_URL = "url";
const TYPE_SCRATCH = "scratch";
const TYPE_SAMPLE = "sample";

class OpenedFile {
  constructor(type, path) {
    // /** @type {TYPE_FILE|TYPE_URL|TYPE_ID|TYPE_SAMPLE} */
    /** @type {TYPE_FILE|TYPE_URL|TYPE_SCRATCH|TYPE_SAMPLE} */
    this.type = type;

    /**
     * Absolute file path or URL
     * @type {string}
     */
    this.path = path;
  }

  async read() {
    if (this.type === TYPE_FILE) {
      return {
        name: path.basename(this.path),
        // data: await readFile(this.path),
        data: await fsPromises.readFile(this.path),
      };
    }

    if (this.type === TYPE_URL) {
      const response = await privilegedFetch(this.path);
      return {
        name: decodeURIComponent(path.basename(this.path)),
        // data: await privilegedFetchAsBuffer(this.path),
        data: await response.arrayBuffer(),
      };
    }

    if (this.type === TYPE_SCRATCH) {
      //   const metadataBuffer = await privilegedFetchAsBuffer(
      const metadataResponse = await privilegedFetch(
        `https://api.scratch.mit.edu/projects/${this.path}`
      );
      //   const metadata = JSON.parse(metadataBuffer.toString());
      const metadata = await metadataResponse.json();
      const token = metadata.project_token;
      const title = metadata.title;

      //   const projectBuffer = await privilegedFetchAsBuffer(
      const projectResponse = await privilegedFetch(
        `https://projects.scratch.mit.edu/${this.path}?token=${token}`
      );
      return {
        name: title,
        // data: projectBuffer,
        data: await projectResponse.arrayBuffer(),
      };
    }

    if (this.type === TYPE_SAMPLE) {
      const sampleRoot = path.resolve(
        __dirname,
        "../../dist-extensions/samples/"
      );
      const joined = path.join(sampleRoot, this.path);
      if (joined.startsWith(sampleRoot)) {
        return {
          name: this.path,
          // data: await readFile(joined),
          data: await fsPromises.readFile(joined),
        };
      }
      throw new Error("Unsafe join");
    }

    throw new Error(`Unknown type: ${this.type}`);
  }
}

const parseOpenedFile = (file, workingDirectory) => {
  let url;
  try {
    url = new URL(file);
  } catch (e) {
    // Error means it was not a valid full URL
  }

  if (url) {
    if (url.protocol === "http:" || url.protocol === "https:") {
      // Scratch URLs require special treatment as they are not direct downloads.
      const scratchMatch = file.match(
        /^https?:\/\/scratch\.mit\.edu\/projects\/(\d+)\/?/
      );
      if (scratchMatch) {
        return new OpenedFile(TYPE_SCRATCH, scratchMatch[1]);
      }

      // Need to manually redirect extension samples to the copies we already have offline as the
      // fetching code will not go through web request handlers or custom protocols.
      // !!! CHANGE !!!
      const sampleMatch = file.match(
        /^https?:\/\/menersar\.github\.io\/Sidekick\/sidekick-extensions\/samples\/(.+\.sb3)$/
      );
      if (sampleMatch) {
        return new OpenedFile(TYPE_SAMPLE, decodeURIComponent(sampleMatch[1]));
      }

      return new OpenedFile(TYPE_URL, file);
    }

    // It was a full valid URL, but we don't support this protocol
    // throw new Error(`Unsupported URL: ${url}`);

    // Don't throw an error just because we don't recognize the URL protocol as
    // Windows paths look close enough to real URLs to be parsed successfully.
  }

  return new OpenedFile(TYPE_FILE, path.resolve(workingDirectory, file));
};

class EditorWindow extends ProjectRunningWindow {
  /**
   * @param {OpenedFile|null} file
   */
  constructor(file) {
    super();

    // This file ID system is not quite perfect. Ideally we would completely revoke permission to access
    // old projects after you load the next one, but our handling of file handles in scratch-gui is
    // pretty bad right now, so this is the best compromise.
    this.openedFiles = [];
    this.activeFileIndex = -1;

    if (file !== null) {
      this.openedFiles.push(file);
      this.activeFileIndex = 0;
    }

    const getFileByIndex = (index) => {
      if (typeof index !== "number") {
        throw new Error("File ID not number");
      }
      const value = this.openedFiles[index];
      if (!(value instanceof OpenedFile)) {
        throw new Error("Invalid file ID");
      }
      return this.openedFiles[index];
    };

    this.window.webContents.on("will-prevent-unload", (event) => {
      const choice = dialog.showMessageBoxSync(this.window, {
        title: APP_NAME,
        type: "info",
        buttons: [translate("unload.stay"), translate("unload.leave")],
        cancelId: 0,
        defaultId: 0,
        message: translate("unload.message"),
        detail: translate("unload.detail"),
      });
      if (choice === 1) {
        event.preventDefault();
      }
    });

    this.window.on("page-title-updated", (event, title, explicitSet) => {
      event.preventDefault();
      if (explicitSet && title) {
        this.window.setTitle(`${title} - ${APP_NAME}`);
      } else {
        this.window.setTitle(APP_NAME);
      }
    });
    this.window.setTitle(APP_NAME);

    /*
      * @type {import("electron").IpcMain}

    ### src-main/windows/editor.js
    In this file, a `ipcMain` module is created via `const ipc = this.window.webContents.ipc`.

    `ipcMain` module:
    - It is an Event Emitter. 
    - When used in the main process, it handles asynchronous and synchronous messages sent from a renderer process (web page).
    - Messages sent from a renderer will be emitted to this module.
    (Source: https://www.electronjs.org/docs/latest/api/ipc-main)

    `ipcMain.on(channel, listener)`:
    Listens to channel, when a new message arrives listener would be called with listener(event, args...).

    - E.g. add the functionality via `ipc.on("gpio-get", (event, gpioPin)` if the message `gpio-get` arrives:
    ```js
    ipc.on("gpio-get", (event, gpioPin) => {
      if (process.platform === "linux") {
        const gpio = require(process.resourcesPath + "/static/gpiolib.node");
        event.returnValue = gpio.get(gpioPin, -1, -1);
      } else {
        event.returnValue = -1;
      }
    });
    ```
    (Source: README.md of sidekick-desktop repository)
    */
    const ipc = this.window.webContents.ipc;

    ipc.handle("get-initial-file", () => {
      if (this.activeFileIndex === -1) {
        return null;
      }
      return this.activeFileIndex;
    });

    ipc.handle("get-file", async (event, index) => {
      const file = getFileByIndex(index);
      const { name, data } = await file.read();
      return {
        name,
        type: file.type,
        data,
      };
    });

    // ipc.handle("get-module", async (event, moduleName) => {
    //   // const module = require("../static/" + moduleName);
    //   const module = require("../static/gpiolib.node");
    //   // const { name, data } = await file.read();
    //   return {
    //     module,
    //   };
    // });

    ipc.on("set-locale", async (event, locale) => {
      if (settings.locale !== locale) {
        settings.locale = locale;
        updateLocale(locale);

        // Imported late due to circular dependency.
        const rebuildMenuBar = require("../menu-bar");
        rebuildMenuBar();

        // Let the save happen in the background, not important
        Promise.resolve().then(() => settings.save());
      }
      event.returnValue = {
        strings: getStrings(),
        mas: !!process.mas,
      };
    });

    ipc.handle("set-changed", (event, changed) => {
      this.window.setDocumentEdited(changed);
    });

    ipc.handle("opened-file", (event, index) => {
      const file = getFileByIndex(index);
      if (file.type !== TYPE_FILE) {
        throw new Error("Not a file");
      }
      this.activeFileIndex = index;
      this.window.setRepresentedFilename(file.path);
    });

    ipc.handle("closed-file", () => {
      this.activeFileIndex = -1;
      this.window.setRepresentedFilename("");
    });

    ipc.handle("show-open-file-picker", async () => {
      const result = await dialog.showOpenDialog(this.window, {
        properties: ["openFile"],
        defaultPath: settings.lastDirectory,
        filters: [
          {
            name: "Scratch Project",
            extensions: ["sb3", "sb2", "sb"],
          },
        ],
      });
      if (result.canceled) {
        return null;
      }

      const file = result.filePaths[0];
      settings.lastDirectory = path.dirname(file);
      await settings.save();

      this.openedFiles.push(new OpenedFile(TYPE_FILE, file));
      return {
        id: this.openedFiles.length - 1,
        name: path.basename(file),
      };
    });

    ipc.handle("show-save-file-picker", async (event, suggestedName) => {
      const result = await dialog.showSaveDialog(this.window, {
        defaultPath: path.join(settings.lastDirectory, suggestedName),
        filters: [
          {
            name: "Scratch 3 Project",
            extensions: ["sb3"],
          },
        ],
      });
      if (result.canceled) {
        return null;
      }

      const file = result.filePath;
      settings.lastDirectory = path.dirname(file);
      await settings.save();

      this.openedFiles.push(new OpenedFile(TYPE_FILE, file));
      return {
        id: this.openedFiles.length - 1,
        name: path.basename(file),
      };
    });

    ipc.handle("get-preferred-media-devices", () => {
      return {
        microphone: settings.microphone,
        camera: settings.camera,
      };
    });

    ipc.on("start-write-stream", async (startEvent, index) => {
      const file = getFileByIndex(index);
      if (file.type !== TYPE_FILE) {
        throw new Error("Not a file");
      }

      const port = startEvent.ports[0];

      /** @type {NodeJS.WritableStream|null} */
      let writeStream = null;

      const handleError = (error) => {
        console.error("Write stream error", error);
        port.postMessage({
          error,
        });

        // Make sure the port is started in case we encounter an error before we normally
        // begin to accept messages.
        port.start();
      };

      try {
        writeStream = await createAtomicWriteStream(file.path);
      } catch (error) {
        handleError(error);
        return;
      }

      writeStream.on("atomic-error", handleError);

      const handleMessage = (data) => {
        if (data.write) {
          if (writeStream.write(data.write)) {
            // Still more space in the buffer. Ask for more immediately.
            return;
          }
          // Wait for the buffer to become empty before asking for more.
          return new Promise((resolve) => {
            writeStream.once("drain", resolve);
          });
        } else if (data.finish) {
          // Wait for the atomic file write to complete.
          return new Promise((resolve) => {
            writeStream.once("atomic-finish", resolve);
            writeStream.end();
          });
        } else if (data.abort) {
          writeStream.emit("error", new Error("Aborted by renderer process"));
          return;
        }
        throw new Error("Unknown message from renderer");
      };

      port.on("message", async (messageEvent) => {
        try {
          const data = messageEvent.data;
          const id = data.id;
          const result = await handleMessage(data);
          port.postMessage({
            response: {
              id,
              result,
            },
          });
        } catch (error) {
          handleError(error);
        }
      });

      port.start();
    });

    ipc.on("alert", (event, message) => {
      event.returnValue = prompts.alert(this.window, message);
    });

    ipc.on("gpio-set", (event, gpioPin, drive) => {
      if (process.platform === "linux") {
        const gpio = require(process.resourcesPath + "/static/gpiolib.node");

        //
        event.returnValue = gpio.set(gpioPin, drive);
        // gpio.set(gpioPin, drive);
        // event.returnValue = 1;
        //
      } else {
        event.returnValue = -1;
      }
    });

    ipc.on("gpio-get", (event, gpioPin) => {
      if (process.platform === "linux") {
        const gpio = require(process.resourcesPath + "/static/gpiolib.node");
        event.returnValue = gpio.get(gpioPin, -1, -1);
      } else {
        event.returnValue = -1;
      }
    });




    ipc.handle("function-call", (event, ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xDMA, ws281xFrequency, ws281xGPIO, ws281xInvert, ws281xBrightness, ws281xStripType) => {

      // const sudoJS2 = require('sudo-js');
      var sudo = require('sudo-prompt');
      var options = {
        name: 'SIDEKICK',
        // icns: 'sidekick-desktop
      };
      // const functionRoot = path.resolve(
      //   __dirname,
      //   "./ws281x-control.js"
      // );
      const functionRoot = path.resolve(
        __dirname,
        "../../../static/ws281x-control.js"
      );
      // const functionRoot = path.resolve(
      //   process.resourcesPath,
      //   "/static/ws281x-control.js"
      // );


      sudo.exec('node ' + functionRoot + ' 7 0 4 #855CD6 10 800000 18 false 125 ws2812', options,
        // sudo.exec('node ./ws281x-control.js 7 0 4 #855CD6 10 800000 18 false 125 ws2812', options,
        function (error, stdout, stderr) {
          if (error) throw error;
          console.log('stdout: ' + stdout);
        }
      );

      var args = {
        START: 1,
        END: 5,
        COLOR: '#855CD6',
      }

      const ledStart = args.START;
      const ledEnd = args.END;
      const hexColor = args.COLOR.toString();

      const NUM_LEDS = 7;
      const GPIO = 18;
      // const COLOR = rgb2Int(255, 0, 0);
      const DMA = 10;
      const FREQUENCY = 800000;
      const INVERT = false;
      const BRIGHTNESS = 125;
      const STRIP_TYPE = 'ws2812';

      // var options = {
      //   dma: DMA,
      //   freq: FREQUENCY,
      //   gpio: GPIO,
      //   invert: INVERT,
      //   brightness: BRIGHTNESS,
      //   stripType: STRIP_TYPE
      // };

      const ledStartIndex = ledStart - 1;
      const ledEndIndex = ledEnd - 1;

      // EditorPreload.ws281xInitColorRender(NUM_LEDS, ledStartIndex, ledEndIndex, hexColor, DMA, FREQUENCY, GPIO, INVERT, BRIGHTNESS, STRIP_TYPE);

      // sudoJS2.setPassword('sidekick');

      // var command = ['node', './ws281x-control.js', NUM_LEDS.toString(), ledStartIndex.toString(), ledEndIndex.toString(), hexColor.toString(), DMA.toString(), FREQUENCY.toString(), GPIO.toString(), INVERT.toString(), BRIGHTNESS.toString(), STRIP_TYPE.toString()];

      // console.log('command: ' + command);

      // sudoJS2.exec(command, function (err, pid, result) {

      //   event.returnValue = 

      // console.log(result);
      // });
    });




    // ipc.on("ws281x-init-color-render", (event, ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xOptions) => {
    ipc.on("ws281x-init-color-render", (event, ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xDMA, ws281xFrequency, ws281xGPIO, ws281xInvert, ws281xBrightness, ws281xStripType) => {

      // console.info("event")
      // console.info(event)
      // console.info("ws281xNumLEDs")
      // console.info(ws281xNumLEDs)
      // console.info("ws281xNumStartLEDs")
      // console.info(ws281xNumStartLEDs)
      // console.info("ws281xNumEndLEDs")
      // console.info(ws281xNumEndLEDs)
      // console.info("ws281xColorLEDs")
      // console.info(ws281xColorLEDs)
      // console.info("ws281xOptions")
      // console.info(ws281xOptions)

      // ws281xOptions.

      ws281xNumLEDs = (ws281xNumLEDs ?? '').toString() || '0';
      ws281xNumStartLEDs = (ws281xNumStartLEDs ?? '').toString() || '0';
      ws281xNumEndLEDs = (ws281xNumEndLEDs ?? '').toString() || '0';
      ws281xColorLEDs = (ws281xColorLEDs ?? '').toString() || '#000000';
      ws281xDMA = (ws281xDMA ?? '').toString() || '10';
      ws281xFrequency = (ws281xFrequency ?? '').toString() || '800000';
      ws281xGPIO = (ws281xGPIO ?? '').toString() || '18';
      ws281xInvert = (ws281xInvert ?? '').toString() || 'false';
      ws281xBrightness = (ws281xBrightness ?? '').toString() || '125';
      ws281xStripType = (ws281xStripType ?? '').toString() || 'ws2812';


      // console.log('ws281xNumLEDs: ' + ws281xNumLEDs + ', ws281xNumStartLEDs: ' + ws281xNumStartLEDs + ', ws281xNumEndLEDs: ' + ws281xNumEndLEDs + ', ws281xColorLEDs: ' + ws281xColorLEDs + ', ws281xDMA: ' + ws281xDMA + ', ws281xFrequency: ' + ws281xFrequency + ', ws281xGPIO: ' + ws281xGPIO + ', ws281xInvert: ' + ws281xInvert + ', ws281xBrightness: ' + ws281xBrightness + ', ws281xStripType: ' + ws281xStripType);
      // event.returnValue = ('ws281xNumLEDs: ' + ws281xNumLEDs + ', ws281xNumStartLEDs: ' + ws281xNumStartLEDs + ', ws281xNumEndLEDs: ' + ws281xNumEndLEDs + ', ws281xColorLEDs: ' + ws281xColorLEDs + ', ws281xDMA: ' + ws281xDMA + ', ws281xFrequency: ' + ws281xFrequency + ', ws281xGPIO: ' + ws281xGPIO + ', ws281xInvert: ' + ws281xInvert + ', ws281xBrightness: ' + ws281xBrightness + ', ws281xStripType: ' + ws281xStripType);

      sudoJS.setPassword('sidekick');

      // var command = ['chmod', '0777', './ws281x-control.js'];
      // var command = ['node', './ws281x-control.js', ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xOptions];
      // var command = ['node', './ws281x-control.js', ws281xNumLEDs.toString(), ws281xNumStartLEDs.toString(), ws281xNumEndLEDs.toString(), ws281xColorLEDs.toString(), ws281xDMA.toString(), ws281xFrequency.toString(), ws281xGPIO.toString(), ws281xInvert.toString(), ws281xBrightness.toString(), ws281xStripType.toString()];
      // var command = ['node', './ws281x-control.js', NUM_LEDS.toString(), ledStartIndex.toString(), ledEndIndex.toString(), hexColor.toString(), DMA.toString(), FREQUENCY.toString(), GPIO.toString(), INVERT.toString(), BRIGHTNESS.toString(), STRIP_TYPE.toString()];

      // console.log('command: ' + command);

      const functionRoot = path.resolve(
        __dirname,
        "../../../static/ws281x-control.js"
      );
      // const functionRoot = path.resolve(
      //   process.resourcesPath,
      //   "/static/ws281x-control.js"
      // );

      // var command = ['node', './ws281x-control.js', ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xDMA, ws281xFrequency, ws281xGPIO, ws281xInvert, ws281xBrightness, ws281xStripType];
      var command = ['node', functionRoot, '7', '0', '4', '#855CD6', '10', '800000', '18', 'false', '125', 'ws2812'];

      // event.returnValue = 1;
      // event.returnValue = 'node' + './ws281x-control.js' + ws281xNumLEDs + ws281xNumStartLEDs + ws281xNumEndLEDs + ws281xColorLEDs + ws281xDMA + ws281xFrequency + ws281xGPIO + ws281xInvert + ws281xBrightness + ws281xStripType;

      // event.returnValue = sudoJS.exec(command, function (err, pid, result) {

      // sudoJS.exec(command, function (err, pid, result) {
      //   console.log(result);// event.returnValue = result;
      // });
      event.returnValue = sudoJS.exec(command, function (err, pid, result) {
        console.log(result);// event.returnValue = result;
      });

      // event.returnValue = 2;



      // ControlWS281X.ws281xInitColorRender(ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xOptions);
      // ControlWS281X.ws281xInitColorRender(ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xDMA, ws281xFrequency, ws281xGPIO, ws281xInvert, ws281xBrightness, ws281xStripType);

      // const ws281x = require("@simontaga/rpi-ws281x-native/lib/ws281x-native");

      // // ws281x = require(process.resourcesPath + "/static/rpi-ws281x-native/lib/ws281x-native");

      // var channel = ws281x(ws281xNumLEDs, ws281xOptions);
      // // var channel = ws281x1(ws281xNumLEDs, ws281xOptions);

      // var pixelData = channel.array;

      // // // ---- trap the SIGINT and reset before exit
      // // process.on('SIGINT', function () {
      // //   ws281x.reset();
      // //   ws281x.finalize();
      // //   process.nextTick(function () { process.exit(0); });
      // // });

      // var iterator = ws281xNumLEDs;
      // while (iterator--) {
      //   pixelData[iterator] = 0;
      // }
      // // for (var i = 0; i < ws281xNumLEDs; i++) {
      // //   pixelData[i] = 0;
      // // }

      // // 1 
      // // 2 - 4
      // // 5 - 7
      // for (var i = ws281xNumStartLEDs; i <= ws281xNumEndLEDs; i++) {
      //   pixelData[i] = ws281xColorLEDs;
      // }

      // // ws281x.render();
      // // ws281x1.render();
      // ws281x.render();
      // event.returnValue = 1;

      // console.log('Press <ctrl>+C to exit.');


      // const ws281x = require(process.resourcesPath + "/static/rpi-ws281x-native/lib/ws281x-native");
      // event.returnValue = new ws281x.Channel
      // event.returnValue = -1;
    });


    // ipc.on("ws281x-bleno", (event) => {

    //   var NUM_LEDS = 10, pixelData = new Uint32Array(NUM_LEDS);
    //   process.on('SIGINT', function () { 
    //     ws281x.reset();
    //     process.nextTick(function () { 
    //       process.exit(0); 
    //     }); 
    //   });

    //   const LED_SERVICE_UUID = "00010000-89BD-43C8-9231-40F6E305F96D"; 
    //   const LED_PATTERN_UUID = "00010001-89BD-43C8-9231-40F6E305F96D"; 
    //   const LED_BRIGHTNESS_UUID = "00010002-89BD-43C8-9231-40F6E305F96D";


    //   bleno.on("stateChange", state => {
    //     if (state === "poweredOn") {

    //       bleno.startAdvertising("PartyLapel", [PARTYLAPEL_SERVICE_UUID], err => {
    //         if (err) console.log(err);
    //       });
    //     } else {
    //       console.log("Stopping...");
    //       bleno.stopAdvertising();
    //     }
    //   });


    //   bleno.on("advertisingStart", err => {
    //     console.log("Configuring services...");

    //     if (err) {
    //       console.error(err);
    //       return;
    //     }
    //     let LEDpattern = new LEDPatternCharacteristic(LED_PATTERN_UUID, "LED Pattern");
    //     let LEDBrightness = new LEDBrightnessCharacteristic(LED_BRIGHTNESS_UUID, "LED Brightness");
    //     let partylapel = new bleno.PrimaryService({
    //       uuid: PARTYLAPEL_SERVICE_UUID,
    //       characteristics: [
    //         LEDpattern,
    //         LEDBrightness
    //       ]
    //     });
    //     bleno.setServices([partylapel], err => {
    //       if (err)
    //         console.log(err);
    //       else
    //         console.log("Services configured");
    //     });
    //   });

    //   event.returnValue = 1;

    // });


    // ipc.on("ws281x-init", (event, ws281xNumLEDs, ws281xOptions) => {

    //   const ws281x = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');

    //   // Return: Channel
    //   event.returnValue = ws281x(ws281xNumLEDs, ws281xOptions);
    // });


    ipc.on("ws281x-render", (event) => {

      const ws281x = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');

      event.returnValue = ws281x.render();

    });

    ipc.on("ws281x-set-color", (event, ws281xChannel, ws281xNumLEDs, ws281xColorLEDs) => {

      // const ws281x = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');

      var pixelData = ws281xChannel.array;

      for (var i = 0; i < ws281xNumLEDs; i++) {
        pixelData[i] = ws281xColorLEDs;
      }

      event.returnValue = pixelData;
    });







    // 
    // --------------------------------------------------------------------------------------------------------------------------------------------------
    // 
    // Call a function via the received function and module name.
    // 
    // Call a function from its name stored in a string using JavaScript:
    // Source: https://www.tutorialspoint.com/how-to-call-a-function-from-its-name-stored-in-a-string-using-javascript
    // 
    // IMPROTANT NOTE: Use of `eval()`:
    // - Executing JavaScript from a string is an BIG security risk.
    // - With eval(), malicious code can run inside your application without permission.
    // - With eval(), third-party code can see the scope of your application, which can lead to possible attacks.
    // 
    // Optional chaining (?.)
    // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
    // - The optional chaining (?.) operator accesses an object's property or calls a function. 
    // - If the object accessed or function called using this operator is undefined or null: 
    //  - The expression short circuits and evaluates to undefined instead of throwing an error.
    // 



    // ipc.on("run-function-of-module", async (event, moduleName, functionName, functionArguments) => {
    //   if (functionName) {
    //     const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
    //     event.returnValue = EditorWindow.executeFunctionByName(requiredModule, functionName, functionArguments);
    //   } else if (!functionName && functionArguments) {
    //     const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
    //     event.returnValue = EditorWindow.executeModuleFunction(requiredModule, functionArguments);
    //     // event.returnValue = require(process.resourcesPath + "/static/" + moduleName);
    //   } else {
    //     const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
    //     // handle('stuffgetList', async () => {
    //     return _.cloneDeep(requiredModule);
    //     // })

    //   }
    //   // if (funtionArguments == "") {
    //   // context[func].apply(context, args);
    //   // event.returnValue = requiredModule[functionName]();
    //   // } else {
    //   // event.returnValue = requiredModule[functionName]();
    //   // }
    //   // if (process.platform === "linux") {
    //   // event.returnValue = requiredModule.get(gpioPin, -1, -1);


    //   // } else {
    //   // event.returnValue = -1;
    //   // }
    // });



    // 
    // --------------------------------------------------------------------------------------------------------------------------------------------------
    // 


    // moduleName: STRING, functionName: STRING, functionArguments: ARRAY)
    ipc.on("function-module-run", (event, moduleName, functionName, functionArguments) => {
      // if (process.platform === "linux") {
      // EditorWindow.executeFunctionByName()

      const functionContext = require(process.resourcesPath + "/static/" + moduleName);
      // moduleName: STRING, functionName: STRING, functionArguments: ARRAY)
      var executedFunction = EditorWindow.executeFunctionByName(functionContext, functionName, functionArguments);
      event.returnValue = executedFunction;

      // gpio.get(gpioPin, -1, -1);
      // } else {
      // event.returnValue = -1;
      // }
    });

    ipc.on("module-get", (event, moduleName) => {
      // if (process.platform === "linux") {
      const module = require(process.resourcesPath + "/static/" + moduleName);
      event.returnValue = module;
      // } else {
      // event.returnValue = -1;
      // }
    });

    ipc.on("gpio-pull", (event, gpioPin, pullOp) => {
      if (process.platform === "linux") {
        const gpio = require(process.resourcesPath + "/static/gpiolib.node");

        //
        event.returnValue = gpio.pull(gpioPin, pullOp);
        // gpio.pull(gpioPin, pullOp);
        // event.returnValue = 1;
        //
      } else {
        event.returnValue = -1;
      }
    });

    ipc.on("confirm", (event, message) => {
      event.returnValue = prompts.confirm(this.window, message);
    });

    ipc.handle("open-packager", () => {
      PackagerWindow.forEditor(this);
    });

    ipc.handle("open-new-window", () => {
      EditorWindow.newWindow();
    });

    ipc.handle("open-addon-settings", () => {
      AddonsWindow.show();
    });

    ipc.handle("open-desktop-settings", () => {
      DesktopSettingsWindow.show();
    });

    ipc.handle("open-privacy", () => {
      PrivacyWindow.show();
    });

    ipc.handle("open-about", () => {
      AboutWindow.show();
    });

    ipc.handle("get-advanced-customizations", async () => {
      const USERSCRIPT_PATH = path.join(
        app.getPath("userData"),
        "userscript.js"
      );
      const USERSTYLE_PATH = path.join(
        app.getPath("userData"),
        "userstyle.css"
      );
      const MODULESCRIPT_PATH = path.join(
        app.getPath("userData"),
        "modulescript.js"
      );

      const [userscript, userstyle, modulescript] = await Promise.all([
        // readFile(USERSCRIPT_PATH, "utf-8").catch(() => ""),
        // readFile(USERSTYLE_PATH, "utf-8").catch(() => ""),
        fsPromises.readFile(USERSCRIPT_PATH, "utf-8").catch(() => ""),
        fsPromises.readFile(USERSTYLE_PATH, "utf-8").catch(() => ""),
        fsPromises.readFile(MODULESCRIPT_PATH, "utf-8").catch(() => ""),
      ]);

      return {
        userscript,
        userstyle,
        modulescript,
      };
    });






    //
    // ipcMain: .handle(channel, listener)
    //
    // (Source: https://www.electronjs.org/de/docs/latest/api/ipc-main)
    //
    // ipcMain.handle(channel, listener)
    //  - channel string
    //  - listener Function < Promise < any > | any >
    //    - event IpcMainInvokeEvent
    //    - ...args any[]
    // Fügt einen Handler für einen invokefähigen IPC hinzu.Dieser Handler wird immer dann aufgerufen, wenn ein Renderer ipcRenderer.invoke(channel, ...args) aufruft.
    // If listener returns a Promise, the eventual result of the promise will be returned as a reply to the remote caller.Otherwise, the return value of the listener will be used as the value of the reply.
    //
    //
    // Rest parameters
    // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
    // - A function definition can only have one rest parameter, and the rest parameter must be the last parameter in the function definition.
    //
    // 
    // Merge Arrays in JavaScript
    // (Source: https://dmitripavlutin.com/javascript-merge-arrays/#1-merge-using-the-spread-operator)
    // 
    // array.push(item1, item2, ..., itemN) also accepts multiple items to push at once, thus you can push an entire array using the spread operator applied to arguments (in other words, performing a merge into):
    //  // merge array2 into array1
    //  array1.push(...array2);
    // For example, let's merge villains into heroes arrays:
    //  const heroes = ['Batman', 'Superman'];
    //  const villains = ['Joker', 'Bane'];
    //  heroes.push(...villains);
    //  console.log(heroes); // ['Batman', 'Superman', 'Joker', 'Bane']
    // 
    // electronIpcMain.handle('runScriptWithResponseAsync', async (event, ...args) => {
    ipc.handle("runScriptWithResponseAsync", async (event, command, ...args) => {
      // if (process.platform === "win32") {

      // let terminalArgs = ['/c'];
      // terminalArgs.push(fileName, ...args);
      // terminalArgs.push(fileName, ...args);
      let scriptArgs = [...args];

      // 
      // app.getAppPath()
      // Returns string - The current application directory.
      // (Source: https://stackoverflow.com/questions/41199981/run-python-script-in-electron-app, https://www.electronjs.org/docs/latest/api/app#appgetapppath)
      // 
      // Where is Electron's app.getAppPath() pointing to?
      // https://stackoverflow.com/questions/40511744/where-is-electrons-app-getapppath-pointing-to
      // So the consolution is : If you want to change the startup script, change it in the main field, not just change it in scritps field...
      // 
      // let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: process.resourcesPath + "/scripts" });
      // 
      // https://github.com/electron-userland/electron-builder/issues/3281
      // 
      // let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: path.join(app.getAppPath(), '..', "scripts") });
      let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: path.join(process.resourcesPath, "scripts") });

      console.log("PID: " + script.pid);

      script.stdout.on("data", (data) => {
        console.log("stdout: " + data);
      });

      script.stderr.on("data", (err) => {
        console.log("stderr: " + err);
      });

      script.on("exit", (code) => {
        console.log("Exit Code: " + code);
      });
      // } else if (process.platform === "linux" || process.platform === "darwin") {
      //   // let script = nodeChildProcess.spawn('bash', ['test.sh', 'arg1', 'arg2']);
      //   let scriptArgs = [...args];
      //   let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: process.resourcesPath + '/scripts' });

      //   console.log('PID: ' + script.pid);

      //   script.stdout.on('data', (data) => {
      //     console.log('stdout: ' + data);
      //   });

      //   script.stderr.on('data', (err) => {
      //     console.log('stderr: ' + err);
      //   });

      //   script.on('exit', (code) => {
      //     console.log('Exit Code: ' + code);
      //   });
      // }
    });


    ipc.on("runScriptSendSync", (event, command, ...args) => {
      let scriptArgs = [...args];

      let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: path.join(process.resourcesPath, "scripts") });

      // event.returnValue = gpio.pull(gpioPin, pullOp);


      // let script = nodeChildProcess.spawn(command, scriptArgs, { cwd: path.join(process.resourcesPath, "scripts") });

      console.log("PID: " + script.pid);

      script.stdout.on("data", (data) => {
        console.log("stdout: " + data);
        event.returnValue = ("stdout: " + data);
      });

      script.stderr.on("data", (err) => {
        console.log("stderr: " + err);
        event.returnValue = ("stderr: " + err);

      });

      script.on("exit", (code) => {
        console.log("Exit Code: " + code);
        event.returnValue = ("Exit Code: " + code);
      });
    });

    // // 
    // // Executing a bash script from Electron app
    // // (Source: https://stackoverflow.com/questions/71973245/executing-a-bash-script-from-electron-app)
    // // 
    // electronIpcMain.on('runScript', (event, data) => {
    //   // Windows
    //   // let script = nodeChildProcess.spawn('cmd.exe', ['/c', 'test.bat', 'arg1', 'arg2']);
    //   if (process.platform === "win32") {
    //     let script = nodeChildProcess.spawn('cmd.exe', ['/c', 'test.bat', 'arg1', 'arg2'], { cwd: process.resourcesPath + '/scripts' });

    //     console.log('PID: ' + script.pid);

    //     script.stdout.on('data', (data) => {
    //       console.log('stdout: ' + data);
    //     });

    //     script.stderr.on('data', (err) => {
    //       console.log('stderr: ' + err);
    //     });

    //     script.on('exit', (code) => {
    //       console.log('Exit Code: ' + code);
    //     });
    //   }
    //   // MacOS & Linux
    //   // (Source: https://stackoverflow.com/questions/8683895/how-do-i-determine-the-current-operating-system-with-node-js)
    //   else if (process.platform === "linux" || process.platform === "darwin") {
    //     let script = nodeChildProcess.spawn('bash', ['test.sh', 'arg1', 'arg2']);

    //     console.log('PID: ' + script.pid);

    //     script.stdout.on('data', (data) => {
    //       console.log('stdout: ' + data);
    //     });

    //     script.stderr.on('data', (err) => {
    //       console.log('stderr: ' + err);
    //     });

    //     script.on('exit', (code) => {
    //       console.log('Exit Code: ' + code);
    //     });
    //   }
    // });




    this.loadURL("sidekick-editor://./gui/gui.html");
    this.show();
  }








  getPreload() {
    return "editor";
  }

  getDimensions() {
    return {
      width: 1280,
      height: 800,
    };
  }

  getBackgroundColor() {
    return "#333333";
  }

  applySettings() {
    this.window.webContents.setBackgroundThrottling(
      settings.backgroundThrottling
    );
  }

  enumerateMediaDevices() {
    // Used by desktop settings
    return new Promise((resolve, reject) => {
      this.window.webContents.ipc.once(
        "enumerated-media-devices",
        (event, result) => {
          if (typeof result.error !== "undefined") {
            reject(result.error);
          } else {
            resolve(result.devices);
          }
        }
      );
      this.window.webContents.send("enumerate-media-devices");
    });
  }

  handleWindowOpen(details) {
    // Open extension sample projects in-app
    // const match = details.url.match(
    // // !!! CHANGE !!!
    //   /^sidekick-editor:\/\/\.\/gui\/editor\?project_url=(https:\/\/menersar\.github\.io\/samples\/.+\.sb3)$/
    // );
    // !!! CHANGE !!!
    const match = details.url.match(
      /^sidekick-editor:\/\/\.\/gui\/editor\?project_url=(https:\/\/menersar\.github\.io\/Sidekick\/sidekick-extensions\/samples\/.+\.sb3)$/
    );
    if (match) {
      EditorWindow.openFiles([match[1]]);
    }
    return super.handleWindowOpen(details);
  }

  /**
   * @param {string[]} files
   * @param {string} workingDirectory
   */
  static openFiles(files, workingDirectory) {
    if (files.length === 0) {
      EditorWindow.newWindow();
    } else {
      for (const file of files) {
        new EditorWindow(parseOpenedFile(file, workingDirectory));
      }
    }
  }

  static newWindow() {
    new EditorWindow(null);
  }


  static executeFunctionByName(functionContext, functionName, functionArguments) {
    functionContext = functionContext == undefined ? window : functionContext;
    // ARRAY (function namespaces):
    var namespaces = functionName.split(".");
    // ARRAY (function arguments):
    // var args = Array.prototype.slice.call(arguments, 2);
    // STRING (function name):
    var func = namespaces.pop();
    // 
    // 
    for (var i = 0; i < namespaces.length; i++) {
      // THIS value:
      functionContext = functionContext[namespaces[i]];
    }
    // RETURN value of FUNCTION call:
    // return context[func].apply(context, args);
    return functionContext[func].apply(functionContext, functionArguments);
  }

  static executeModuleFunction(functionContext, functionArguments) {
    functionContext = functionContext == undefined ? window : functionContext;
    // ARRAY (function namespaces):
    // var namespaces = functionName.split(".");
    // ARRAY (function arguments):
    // var args = Array.prototype.slice.call(arguments, 2);
    // STRING (function name):
    // var func = namespaces.pop();
    // 
    // 
    // for (var i = 0; i < namespaces.length; i++) {
    //   // THIS value:
    //   functionContext = functionContext[namespaces[i]];
    // }
    // RETURN value of FUNCTION call:
    // return context[func].apply(context, args);
    // return functionContext.apply(functionContext, functionArguments);

    // return eval(functionContext + "(" + functionArguments + ")");
    // Use the elements of an array as arguments to a function via:
    // - Function.prototype.apply()
    // or
    // With spread syntax. (e.g.: function myFunction(x, y, z) {} const args = [0, 1, 2]; myFunction(...args);)
    // (Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_function_calls)
    return functionContext(...functionArguments);
  }


  // static executeFunctionByName(functionName, context /*, args */) {
  //   context = context == undefined? window:context;
  //   // 
  //   // 
  //   // `namespaces` = 'array' from devided `functionName` by `.` (substrings of string `functionName` put into and returned as an array).
  //   // `functionName` = String value.
  //   // 
  //   // ARRAY (function namespaces):
  //   var namespaces = functionName.split(".");
  //   // 
  //   // 
  //   // `args` = 'array' from `arguments`, starting at 'index = 2' (converted from array-like or iterable object `args` into a genuine array).
  //   // `arguments` = 'array-like object' with function's 'arguments' as values (accessible inside functions).
  //   // 
  //   // ARRAY (function arguments):
  //   var args = Array.prototype.slice.call(arguments, 2);    
  //   // 
  //   // 
  //   // `func` = last element from array `namespaces` (removed from `namespaces`).
  //   // 
  //   // STRING (function name):
  //   var func = namespaces.pop();
  //   // 
  //   // 
  //   for (var i = 0; i < namespaces.length; i++) {
  //     // Context: Environment in which something is being run.
  //     // Context: May change depending on how the code is being run.
  //     // Namespaces: Defines a fixed environment.
  //     // (Source: https://stackoverflow.com/questions/8182110/what-is-the-difference-between-context-and-namespace#:~:text=While%20JavaScript%20doesn't%20have,referenced%20by%20the%20this%20keyword.)
  //     //
  //     // Context of the to be executed target function.
  //     // (Source: https://stackoverflow.com/a/4351575/21550052) 
  //     // 
  //     // 
  //     // THIS value:
  //     context = context[namespaces[i]];
  //   }
  //   // 
  //   // 
  //   // `apply()` method calls a function of Function instances with a given `this` value, and `arguments` provided as an 'array' (or an array-like object).
  //   // 
  //   // The keyword `this` resolves to a value and typically points to an object. What it points to depends on the context.
  //   // (Source: https://wiki.selfhtml.org/wiki/JavaScript/Tutorials/OOP/Objektverf%C3%BCgbarkeit_und_this; redirected through the keyword 'this' from this source: https://wiki.selfhtml.org/wiki/JavaScript/Objekte/Function/apply)
  //   // 
  //   // `context` = '`this` value'.
  //   // `args` = 'array'.
  //   // 
  //   // RETURN value of FUNCTION call:
  //   return context[func].apply(context, args);
  // }


}

module.exports = EditorWindow;
