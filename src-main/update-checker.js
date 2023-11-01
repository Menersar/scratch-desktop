// const semverLt = require("semver/functions/lt");
const settings = require("./settings");
const UpdateWindow = require("./windows/update");
const packageJSON = require("../package.json");
// const privilegedFetchAsBuffer = require("./fetch");
const privilegedFetch = require("./fetch");

const currentVersion = packageJSON.version;
const URL = "https://menersar.github.io/sidekick-desktop/version.json";

const isEnabledAtBuildTime = () => packageJSON.sidekick_update === "yes";

const checkForUpdates = async () => {
  if (!isEnabledAtBuildTime() || settings.updateChecker === "never") {
    return;
  }

  // const jsonBuffer = await privilegedFetchAsBuffer(URL);
  const jsonResponse = await privilegedFetch(URL);
  // const json = JSON.parse(jsonBuffer.toString());
  const json = await jsonResponse.json();
  const latestStable = json.latest;
  const latestUnstable = json.latest_unstable;
  const oldestSafe = json.oldest_safe;

  // Imported lazily as it takes about 10ms to import
  const semverLt = require("semver/functions/lt");

  // Security updates can not be ignored.
  if (semverLt(currentVersion, oldestSafe)) {
    UpdateWindow.updateAvailable(currentVersion, latestStable, true);
    return;
  }

  if (settings.updateChecker === "security") {
    // Nothing further to check
    return;
  }

  const latest =
    settings.updateChecker === "unstable" ? latestUnstable : latestStable;
  const now = Date.now();
  const ignoredUpdate = settings.ignoredUpdate;
  const ignoredUpdateUntil = settings.ignoredUpdateUntil * 1000;
  if (ignoredUpdate === latest && now < ignoredUpdateUntil) {
    // This update was ignored
    return;
  }

  if (semverLt(currentVersion, latest)) {
    UpdateWindow.updateAvailable(currentVersion, latest, false);
  }
};

/**
 * @param {string} version
 * @param {Date} until
 */
const ignoreUpdate = async (version, until) => {
  settings.ignoredUpdate = version;
  settings.ignoredUpdateUntil = Math.floor(until.getTime() / 1000);
  await settings.save();
};

module.exports = {
  isEnabledAtBuildTime,
  checkForUpdates,
  ignoreUpdate,
};
