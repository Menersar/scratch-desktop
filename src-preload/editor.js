const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("EditorPreload", {
    getInitialFile: () => ipcRenderer.invoke("get-initial-file"),
    getFile: (id) => ipcRenderer.invoke("get-file", id),
    // getModule: (id) => ipcRenderer.invoke("get-module", id),
    openedFile: (id) => ipcRenderer.invoke("opened-file", id),
    closedFile: () => ipcRenderer.invoke("closed-file"),
    showSaveFilePicker: (suggestedName) =>
        ipcRenderer.invoke("show-save-file-picker", suggestedName),
    showOpenFilePicker: () => ipcRenderer.invoke("show-open-file-picker"),
    setLocale: (locale) => ipcRenderer.sendSync("set-locale", locale),
    setChanged: (changed) => ipcRenderer.invoke("set-changed", changed),
    openNewWindow: () => ipcRenderer.invoke("open-new-window"),
    openAddonSettings: () => ipcRenderer.invoke("open-addon-settings"),
    openPackager: () => ipcRenderer.invoke("open-packager"),
    openDesktopSettings: () => ipcRenderer.invoke("open-desktop-settings"),
    openPrivacy: () => ipcRenderer.invoke("open-privacy"),
    openAbout: () => ipcRenderer.invoke("open-about"),
    getPreferredMediaDevices: () =>
        ipcRenderer.invoke("get-preferred-media-devices"),
    getAdvancedCustomizations: () =>
        ipcRenderer.invoke("get-advanced-customizations"),
    setExportForPackager: (callback) => {
        exportForPackager = callback;
    },
    gpioSet: (pin, drive) => ipcRenderer.sendSync("gpio-set", pin, drive),
    gpioGet: (pin) => ipcRenderer.sendSync("gpio-get", pin),
    gpioPull: (pin, op) => ipcRenderer.sendSync("gpio-pull", pin, op),
    // moduleGet: (module) => ipcRenderer.sendSync("module-get", module),
    // runModuleFunction: (mdl, fct, ...argmts) => ipcRenderer.sendSync("function-module-run", mdl, fct, ...argmts),
    // 
    // 
    // mdl (moduleName): STRING, fct (functionName): STRING, argmt (functionArguments): ARRAY)
    // runFunctionOfModule: (mdl, fct, argmt) => ipcRenderer.sendSync("run-function-of-module", mdl, fct, argmt),
    // 
    //
    // ws281xInitColorRender: (leds, start, end, color, optns) => ipcRenderer.sendSync("ws281x-init-color-render", leds, start, end, color, optns),
    ws281xInitColorRender: (leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype) => ipcRenderer.sendSync("ws281x-init-color-render", leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype),
    // ws281xInit: (leds, optns) => ipcRenderer.sendSync("ws281x-init", leds, optns),
    // DMA, FREQUENCY, GPIO, INVERT, BRIGHTNESS, STRIP_TYPE

    functionCall: (leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype) => ipcRenderer.invoke("function-call", leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype),
    // functionCall: (leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype) => ipcRenderer. invoke("ws281x-init-color-render", leds, start, end, color, dma, freq, gpio, inv, brghtnss, strptype),

    // invokeScriptWithResponseAsync: (command, args) => ipcRenderer.invoke("runScriptWithResponseAsync", command, args),
    invokeScriptWithResponseAsync: (command, args) => { return ipcRenderer.invoke("runScriptWithResponseAsync", command, args) },
    runScriptSendSync: (command, args) => ipcRenderer.sendSync("runScriptSendSync", command, args),
    // sudoScript: (command, args) => ipcRenderer.send('sudo-script', command, args),
    // sudoScript: (command, args) => ipcRenderer.sendSync('sudo-script', command, args),
    sudoScript: (command, args) => ipcRenderer.sendSync('sudo-script', command, args),
    runShellScript: (fileName, args) => ipcRenderer.send('run-shell-script', fileName, args),


    // sudoScript: (sudoCall, command, scriptName, args) => ipcRenderer.send('sudo-script', sudoCall, command, scriptName, args),



    sendToMain: function () {
        ipcRenderer.send("sendToMain");
    },
    // receiveFromMain: function (func) {
    //     ipcRenderer.on("receiveFromMain", (event, ...args) => func(event, ...args));
    // },


});


// // White-listed channels.
// const ipc = {
//   'render': {
//     // From render to main.
//     'send': [
//       'runScript' // Channel name
//     ],
//     'sendSync': [
//       'runScriptSync' // Channel name
//     ],
//     // From main to render.
//     'receive': [
//       'getResponse'
//     ],
//     // From render to main and back again.
//     'sendReceive': [
//       'runScriptWithResponseAsync' // Channel name
//     ]
//   }
// };

// // Exposed protected methods in the render process.
// contextBridge.exposeInMainWorld(
//   // Allowed 'ipcRenderer' methods.
//   'ipcRenderSend', {
//   // From render to main.
//   send: (channel, args) => {
//     let validChannels = ipc.render.send;
//     if (validChannels.includes(channel)) {
//       ipcRenderer.send(channel, args);
//     }
//   },
//   sendSync: (channel, args) => {
//     let validChannels = ipc.render.sendSync;
//     if (validChannels.includes(channel)) {
//       ipcRenderer.sendSync(channel, args);
//     }
//   },
//   // From main to render.
//   receive: (channel, listener) => {
//     let validChannels = ipc.render.receive;
//     if (validChannels.includes(channel)) {
//       // Deliberately strip event as it includes `sender`.
//       ipcRenderer.on(channel, (event, ...args) => listener(...args));
//     }
//   },
//   // From render to main and back again.
//   invoke: (channel, command, args) => {
//     let validChannels = ipc.render.sendReceive;
//     if (validChannels.includes(channel)) {
//       return ipcRenderer.invoke(channel, command, args);
//     }
//   }
// }
// );




let exportForPackager = () =>
    Promise.reject(new Error("exportForPackager missing"));

ipcRenderer.on("export-project-to-port", (e) => {
    const port = e.ports[0];
    exportForPackager()
        .then(({ data, name }) => {
            port.postMessage({ data, name });
        })
        .catch((error) => {
            console.error(error);
            port.postMessage({ error: true });
        });
});

window.addEventListener("message", (e) => {
    if (e.source === window) {
        const data = e.data;
        if (data && typeof data.ipcStartWriteStream === "number") {
            ipcRenderer.postMessage(
                "start-write-stream",
                data.ipcStartWriteStream,
                e.ports
            );
        }
    }
});

ipcRenderer.on("enumerate-media-devices", (e) => {
    navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
            e.sender.send("enumerated-media-devices", {
                devices: devices.map((device) => ({
                    deviceId: device.deviceId,
                    kind: device.kind,
                    label: device.label,
                })),
            });
        })
        .catch((error) => {
            console.error(error);
            e.sender.send("enumerated-media-devices", {
                error: `${error}`,
            });
        });
});

contextBridge.exposeInMainWorld("PromptsPreload", {
    alert: (message) => ipcRenderer.sendSync("alert", message),
    confirm: (message) => ipcRenderer.sendSync("confirm", message),
});

// Expose the native module to the renderer process
contextBridge.exposeInMainWorld("ModuleGpiolib", {
    // Define functions or properties you want to expose
    // Example:
    // someFunction: yourModule.someFunction,
    set: (gpio, drive) => ipcRenderer.sendSync("set-gpio", gpio, drive),
    get: (pin) => ipcRenderer.sendSync("get-gpio", pin),
});

// contextBridge.exposeInMainWorld(
//   // Namespace inside the `Window` object where you want to extend properties.
//   "RequireModule",
//   // Your properties.
//   {
//     // window.RequireModule.require(moduleName)
//     require: (moduleName) => ipcRenderer.invoke("require-module", moduleName),
//   }
// );
