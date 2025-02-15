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

const bleno = require("bleno");
var ws281x = require('rpi-ws281x-native/lib/ws281x-native');


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




    ipc.on("ws281x-init-color-render", (event, ws281xNumLEDs, ws281xNumStartLEDs, ws281xNumEndLEDs, ws281xColorLEDs, ws281xOptions) => {

      // ws281x = require(process.resourcesPath + "/static/rpi-ws281x-native/lib/ws281x-native");

      var channel = ws281x(ws281xNumLEDs, ws281xOptions);
      // var channel = ws281x1(ws281xNumLEDs, ws281xOptions);

      var pixelData = channel.array;


      var NUM_LEDS = 10, pixelData = new Uint32Array(NUM_LEDS);


      // // ---- trap the SIGINT and reset before exit
      // process.on('SIGINT', function () {
      //   ws281x.reset();
      //   ws281x.finalize();
      //   process.nextTick(function () { process.exit(0); });
      // });

      for (var i = ws281xNumStartLEDs; i < ws281xNumEndLEDs; i++) {
        pixelData[i] = ws281xColorLEDs;
      }

      ws281x.render();
      // ws281x1.render();
      event.returnValue = 1;

      // console.log('Press <ctrl>+C to exit.');


      // const ws281x = require(process.resourcesPath + "/static/rpi-ws281x-native/lib/ws281x-native");
      // event.returnValue = new ws281x.Channel
      // event.returnValue = -1;
    });


    ipc.on("ws281x-init", (event, ws281xNumLEDs, ws281xOptions) => {

      const ws281x = require(process.resourcesPath + '/static/rpi-ws281x-native/lib/ws281x-native');

      // Return: Channel
      event.returnValue = ws281x(ws281xNumLEDs, ws281xOptions);
    });


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
    ipc.on("run-function-of-module", async (event, moduleName, functionName, functionArguments) => {
      if (functionName) {
        const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
        event.returnValue = EditorWindow.executeFunctionByName(requiredModule, functionName, functionArguments);
      } else if (!functionName && functionArguments) {
        const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
        event.returnValue = EditorWindow.executeModuleFunction(requiredModule, functionArguments);
        // event.returnValue = require(process.resourcesPath + "/static/" + moduleName);
      } else {
        const requiredModule = await require(process.resourcesPath + "/static/" + moduleName);
        // handle('stuffgetList', async () => {
        return _.cloneDeep(requiredModule);
        // })

      }
      // if (funtionArguments == "") {
      // context[func].apply(context, args);
      // event.returnValue = requiredModule[functionName]();
      // } else {
      // event.returnValue = requiredModule[functionName]();
      // }
      // if (process.platform === "linux") {
      // event.returnValue = requiredModule.get(gpioPin, -1, -1);


      // } else {
      // event.returnValue = -1;
      // }
    });
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
