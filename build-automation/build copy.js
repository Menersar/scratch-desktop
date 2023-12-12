// C:\Users\mener\Desktop\sidekick-application\sidekick-desktop\node_modules\@types\node\process.d.ts
// Help source:
// https://corgibytes.com/blog/2017/04/18/npm-tips/
// https://stackoverflow.com/questions/18146354/how-can-i-cut-a-string-after-x-characters -> https://stackoverflow.com/a/51307037/21550052
// https://github.com/flaviotulino/npm-commands
// https://stackoverflow.com/questions/70890354/child-process-execsync-executing-a-npm-run-script-cant-find-the-package-json

// const { execSync } = require("child_process");
// const { start } = require("repl");

// we need to run our script, so we need to run a new process
const { execSync } = require("child_process");
const currentFolderPath = __dirname;

const currentPlatform = process.platform;

const currentArchitecture = process.arch;

if (currentPlatform <= 0) {
  console.error(
    `[ Error ] could not determine a valid platform via 'process.platform'.`
  );
  process.exit(1);
}
console.log("current platform:", currentPlatform);

if (currentArchitecture <= 0) {
  console.error(
    `[ Error ] could not determine a valid currentArchitecture via 'process.currentArchitecture'.`
  );
  process.exit(1);
}
console.log("current currentArchitecture:", currentArchitecture);

let platformShort = currentPlatform;

if (currentPlatform.length > 1) {
  platformShort = currentPlatform.slice(0, 1);
  //   substring(0, 3);
}

console.log("current platform short:", platformShort, platformShort.length);


electron-builder --windows nsis --x64



// // in case you have no params to pass through
// execSync(`npm run build:${platformShort}`, {
//   stdio: "inherit",
//   cwd: currentFolderPath,
// });

// execSync("cd ..");
// execSync(`npm run build:${platformShort}`);
// execSync("npm run build -- task:target");

// execSync("npm run minify");
// execSync("npm run build_assets");

// const platformShort = currentPlatform.slice(3);

// // const task = process.env.npm_lifecycle_event;
// const packageJSON = require("../package.json");
// const availableEnvironments = Object.keys(packageJSON.scripts);
//   .filter((key) => key.startsWith(task))
//   .map((key) => key.split(":")[1])
//   .filter((key) => key);

// if (!process.env.NODE_ENV) {
//   console.error(
//     `[ Error ] NODE_ENV is required. Use ${task}:${availableEnvironments.join(
//       "/"
//     )} scripts instead.`
//   );
//   process.exit(1);
// }

// if (!availableEnvironments.includes(env)) {
//   console.error(
//     `[ Error ] ${env} is not valid NODE_ENV. Use ${task}:${availableEnvironments.join(
//       "/"
//     )} scripts instead.`
//   );
//   process.exit(1);
// }

process.exit(0);
