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
});

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
