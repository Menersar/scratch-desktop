// const {session} = require('electron');
const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const settings = require('./settings');
const MigrateWindow = require('./windows/migrate');

// This needs to run before the app is ready.
const userData = app.getPath('userData');
const isFirstLaunch = (
  settings.dataVersion !== MigrateWindow.LATEST_VERSION &&
  !fs.existsSync(path.join(userData, 'Cache'))
);

const migrate = async () => {
  if (settings.dataVersion === MigrateWindow.LATEST_VERSION) {
    return;
  }

  // Do not need to migrate anything on a fresh install.
  // const cacheSize = await session.defaultSession.getCacheSize();
  // if (cacheSize === 0) {
  if (isFirstLaunch) {
    settings.dataVersion = MigrateWindow.LATEST_VERSION;
    await settings.save();
    return;
  }

  return MigrateWindow.run();
};

module.exports = migrate;
