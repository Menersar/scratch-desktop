// All error-handling code here as minimal and self contained as possible:
// Ensure that the error handling does not itself have errors.

const { app, dialog } = require("electron");

const APP_NAME = "SIDEKICK Desktop";
const stringifyError = (error) => (error && error.stack ? error.stack : error);

// process.on("unhandledRejection", (error) => {
//   console.error("Error in promise:", error);
//   app.whenReady().then(() => {
//     dialog.showMessageBoxSync({
//       type: "error",
//       title: APP_NAME,
//       message: `Error in promise: ${stringifyError(error)}`,
//     });
//   });
// });

try {
    process.on("unhandledRejection", (error) => {
      console.error("Error in promise:", error);
      app.whenReady().then(() => {
        dialog.showMessageBoxSync({
          type: "error",
          title: APP_NAME,
          message: `Error in promise: ${stringifyError(error)}`,
        });
      });
    });


  require("./index");
} catch (error) {
  // // It's very important that this code here be minimal and self-contained so
  // // that we don't have an error in the error handling code.
  // console.error(error);
  // const {app, dialog} = require('electron');
  console.error("Error starting main process:", error);
  app.whenReady().then(() => {
    dialog.showMessageBoxSync({
      type: "error",
      // title: 'Error',
      // message: `Error starting main process:\n\n${(error && error.stack) ? error.stack : error}`
      title: APP_NAME,
      message: `Error starting main process: ${stringifyError(error)}`,
    });
    app.exit(1);
  });
}
