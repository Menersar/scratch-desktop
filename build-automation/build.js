// C:\Users\mener\Desktop\sidekick-application\sidekick-desktop\node_modules\@types\node\process.d.ts
// Help source:
// https://corgibytes.com/blog/2017/04/18/npm-tips/
// https://stackoverflow.com/questions/18146354/how-can-i-cut-a-string-after-x-characters -> https://stackoverflow.com/a/51307037/21550052
// https://github.com/flaviotulino/npm-commands
// https://stackoverflow.com/questions/70890354/child-process-execsync-executing-a-npm-run-script-cant-find-the-package-json -> https://stackoverflow.com/a/70890492/21550052

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch?retiredLocale=de

// const { execSync } = require("child_process");
// const { start } = require("repl");

// cli.js build

// Build

// Commands:
//   cli.js build                    Build                                [default]
//   cli.js install-app-deps         Install app deps
//   cli.js node-gyp-rebuild         Rebuild own native code
//   cli.js create-self-signed-cert  Create self-signed code signing cert for
//                                   Windows apps
//   cli.js start                    Run application in a development mode using
//                                   electron-webpack

// Building:
//   -m, -o, --mac, --macos       Build for macOS, accepts target list (see
//                                https://goo.gl/5uHuzj).                   [array]
//   -l, --linux                  Build for Linux, accepts target list (see
//                                https://goo.gl/4vwQad)                    [array]
//   -w, --win, --windows         Build for Windows, accepts target list (see
//                                https://goo.gl/jYsTEJ)                    [array]
//       --x64                    Build for x64                           [boolean]
//       --ia32                   Build for ia32                          [boolean]
//       --armv7l                 Build for armv7l                        [boolean]
//       --arm64                  Build for arm64                         [boolean]
//       --universal              Build for universal                     [boolean]
//       --dir                    Build unpacked dir. Useful to test.     [boolean]
//       --prepackaged, --pd      The path to prepackaged app (to pack in a
//                                distributable format)
//       --projectDir, --project  The path to project directory. Defaults to
//                                current working directory.
//   -c, --config                 The path to an electron-builder config. Defaults
//                                to `electron-builder.yml` (or `json`, or `json5`,
//                                or `js`, or `ts`), see https://goo.gl/YFRJOM

// Publishing:
//   -p, --publish  Publish artifacts, see https://goo.gl/tSFycD
//                 [choices: "onTag", "onTagOrDraft", "always", "never", undefined]

// Other:
//       --help     Show help                                             [boolean]
//       --version  Show version number                                   [boolean]

// Examples:
//   electron-builder -mwl                     build for macOS, Windows and Linux
//   electron-builder --linux deb tar.xz       build deb and tar.xz for Linux
//   electron-builder --win --ia32             build for Windows ia32
//   electron-builder                          set package.json property `foo` to
//   -c.extraMetadata.foo=bar                  `bar`
//   electron-builder                          configure unicode options for NSIS
//   --config.nsis.unicode=false

// See https://electron.build for more documentation.

// we need to run our script, so we need to run a new process
const { execSync } = require("child_process");
const currentFolderPath = __dirname;
// const currentFolderPath = process.cwd();
// const currentFolderPath = process.argv[2];
// process.env.
// console.log("current folder path:", currentFolderPath);

// const buildArgument1 = process.argv[2];
const buildArgumentPlatform = process.argv[2];
console.log("build argument platform:", buildArgumentPlatform);

const buildArgumentArchitecture = process.argv[3];
let hasBuildArgumentArchitecture = false;
let slicedBuildArgumentArchitecture = buildArgumentArchitecture;

const buildArgumentTarget = process.argv[4];
let hasBuildArgumentTarget = false;
let slicedBuildArgumentTarget = buildArgumentTarget;

if (buildArgumentTarget) {
  if (buildArgumentTarget.length >= 1) {
    slicedBuildArgumentTarget = buildArgumentTarget.slice(0);
    // console.log("sliced build argument target:", slicedBuildArgumentTarget);
    if (
      slicedBuildArgumentTarget == "nsis" ||
      slicedBuildArgumentTarget == "portable" ||
      slicedBuildArgumentTarget == "appx" ||
      slicedBuildArgumentTarget == "dmg" ||
      slicedBuildArgumentTarget == "deb" ||
      slicedBuildArgumentTarget == "tar.gz" ||
      slicedBuildArgumentTarget == "AppImage"
    ) {
      hasBuildArgumentTarget = true;
      console.log("build argument target:", buildArgumentTarget);
    } else {
      console.error(
        `[ Error ] The given target build argument '${buildArgumentTarget}' is not a valid target. Valid arguments are e.g. nsis, portable, appx for windows or dmg for mac or deb, tar.gz, AppImage for linux.`
      );
      process.exit(1);
    }
  }
}

if (buildArgumentArchitecture) {
  if (buildArgumentArchitecture.length >= 1) {
    slicedBuildArgumentArchitecture = buildArgumentArchitecture.slice(0);
    // console.log(
    //   "sliced build argument architecture:",
    //   slicedBuildArgumentArchitecture
    // );
    if (
      slicedBuildArgumentArchitecture == "x64" ||
      slicedBuildArgumentArchitecture == "ia32" ||
      slicedBuildArgumentArchitecture == "armv7l" ||
      slicedBuildArgumentArchitecture == "arm64" ||
      slicedBuildArgumentArchitecture == "universal" ||
      slicedBuildArgumentArchitecture == "dir"
    ) {
      hasBuildArgumentArchitecture = true;
      console.log("build argument architecture:", buildArgumentArchitecture);
    } else {
      console.error(
        `[ Error ] The given architecture build argument '${buildArgumentArchitecture}' is not a valid architecture. Valid arguments are e.g. --x64, --ia32, --armv7l, --arm64, --universal, --dir.`
      );
      process.exit(1);
    }
  }
}

if (buildArgumentPlatform != undefined) {
  // Is a platform specified via an argument argument:
  // Build for the specified platform.
  // E.g. to build for windows platform: 'npm run build --windows'
  if (buildArgumentPlatform.length >= 1) {
    // Shorten the 'buildArgument' variable.
    // console.log("build argument platform:", buildArgumentPlatform);
    const shortBuildArgumentPlatform = buildArgumentPlatform[0];
    // console.log("short build argument platform:", shortBuildArgumentPlatform);

    switch (shortBuildArgumentPlatform) {
      case "w":
        if (hasBuildArgumentTarget && hasBuildArgumentArchitecture) {
          execSync(
            `cd .. && npx electron-builder --windows ${slicedBuildArgumentTarget} --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-win-${slicedBuildArgumentTarget}-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
        } else if (hasBuildArgumentArchitecture) {
          execSync(
            `cd .. && npx electron-builder --windows nsis --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-win-nsis-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows appx --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-appx-${slicedBuildArgumentArchitecture}`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
          if (slicedBuildArgumentArchitecture == "x64") {
            execSync(
              `cd .. && npx electron-builder --windows portable --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-win-portable-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes`,
              {
                stdio: "inherit",
                cwd: currentFolderPath,
              }
            );
          }
        } else {
          execSync(
            `cd .. && npx electron-builder --windows nsis --x64 --publish never --config.extraMetadata.sidekick_dist=prod-win-nsis-x64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows nsis --ia32 --publish never --config.extraMetadata.sidekick_dist=prod-win-nsis-ia32 --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows nsis --arm64 --publish never --config.extraMetadata.sidekick_dist=prod-win-nsis-arm64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows portable --x64 --publish never --config.extraMetadata.sidekick_dist=prod-win-portable-x64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows appx --x64 --publish never --config.extraMetadata.sidekick_dist=prod-appx-x64 && npx electron-builder --windows appx --ia32 --publish never --config.extraMetadata.sidekick_dist=prod-appx-ia32 && npx electron-builder --windows appx --arm64 --publish never --config.extraMetadata.sidekick_dist=prod-appx-arm64`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
        }

        process.exit(0);
      case "l":
        if (hasBuildArgumentTarget && hasBuildArgumentArchitecture) {
          execSync(
            `cd .. && npx electron-builder --linux ${slicedBuildArgumentTarget} --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-${slicedBuildArgumentTarget}-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
        } else if (hasBuildArgumentArchitecture) {
          execSync(
            `cd .. && npx electron-builder --linux deb --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-deb-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux tar.gz --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-tar-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux AppImage --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-appimage-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
        } else {
          execSync(
            `cd .. && npx electron-builder --linux deb --x64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-deb-x64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux deb --arm64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-deb-arm64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux deb --armv7l --publish never --config.extraMetadata.sidekick_dist=prod-linux-deb-armv7l --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux tar.gz --x64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-tar-x64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux tar.gz --arm64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-tar-arm64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux tar.gz --armv7l --publish never --config.extraMetadata.sidekick_dist=prod-linux-tar-armv7l --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux AppImage --x64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-appimage-x64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux AppImage --arm64 --publish never --config.extraMetadata.sidekick_dist=prod-linux-appimage-arm64 --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux AppImage --armv7l --publish never --config.extraMetadata.sidekick_dist=prod-linux-appimage-armv7l --config.extraMetadata.sidekick_update=yes`,
            {
              stdio: "inherit",
              cwd: currentFolderPath,
            }
          );
        }
        process.exit(0);
      case "m":
        // if (hasBuildArgumentTarget && hasBuildArgumentArchitecture) {
        //   execSync(
        //     `cd .. && npx electron-builder --mac ${slicedBuildArgumentTarget} --${slicedBuildArgumentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-mac-${slicedBuildArgumentTarget}-${slicedBuildArgumentArchitecture} --config.extraMetadata.sidekick_update=yes`,
        //     {
        //       stdio: "inherit",
        //       cwd: currentFolderPath,
        //     }
        //   );
        // } else
        // if (hasBuildArgumentArchitecture) {

        // } else {
        execSync(
          `cd .. && npx electron-builder --mac dmg --universal --publish never --config.extraMetadata.sidekick_dist=prod-mac --config.extraMetadata.sidekick_update=yes`,
          {
            stdio: "inherit",
            cwd: currentFolderPath,
          }
        );
        // }
        process.exit(0);
      default:
        console.error(
          `[ Error ] The given build argument '${buildArgumentPlatform}' is not a valid platform. Valid arguments are e.g. --windows, --linux, --mac or --w, --l, --m.`
        );
        process.exit(1);
    }

    // // in case you have no params to pass through
    // execSync(
    //   `cd .. && electron-builder -${platformShort} nsis --${currentArchitecture}`,
    //   {
    //     stdio: "inherit",
    //     cwd: currentFolderPath,
    //   }
    // );

    process.exit(0);
  }
} else {
  // Is no platform specified:
  // Build for current platform.
  const currentPlatform = process.platform;
  const currentArchitecture = process.arch;
  let platformShort = currentPlatform;

  if (currentPlatform <= 0) {
    console.error(
      `[ Error ] could not determine a valid platform via 'process.platform'.`
    );
    process.exit(1);
  }
  // console.log("current platform:", currentPlatform);

  if (currentArchitecture <= 0) {
    console.error(
      `[ Error ] could not determine a valid currentArchitecture via 'process.currentArchitecture'.`
    );
    process.exit(1);
  }
  // console.log("current architecture:", currentArchitecture);

  if (currentPlatform.length > 1) {
    platformShort = currentPlatform.slice(0, 1);
    //   substring(0, 3);
  }

  // console.log("current platform short:", platformShort, platformShort.length);

  //   // in case you have no params to pass through
  //   execSync(
  //     `cd .. && electron-builder -${platformShort} nsis --${currentArchitecture}`,
  //     {
  //       stdio: "inherit",
  //       cwd: currentFolderPath,
  //     }
  //   );

  switch (platformShort) {
    case "w":
      // in case you have no params to pass through
      execSync(
        `cd .. && npx electron-builder --windows nsis --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-win-nsis-${currentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --windows appx --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-appx-${currentArchitecture}`,
        {
          stdio: "inherit",
          cwd: currentFolderPath,
        }
      );
      if (currentArchitecture == "x64") {
        execSync(
          `cd .. && npx electron-builder --windows portable --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-win-portable-${currentArchitecture} --config.extraMetadata.sidekick_update=yes`,
          {
            stdio: "inherit",
            cwd: currentFolderPath,
          }
        );
      }
      process.exit(0);

    case "l":
      // in case you have no params to pass through
      execSync(
        `cd .. && npx electron-builder --linux deb --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-deb-${currentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux tar.gz --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-tar-${currentArchitecture} --config.extraMetadata.sidekick_update=yes && npx electron-builder --linux AppImage --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-linux-appimage-${currentArchitecture} --config.extraMetadata.sidekick_update=yes`,
        {
          stdio: "inherit",
          cwd: currentFolderPath,
        }
      );
      process.exit(0);

    case "m":
      // in case you have no params to pass through
      execSync(
        `npx electron-builder --mac dmg --${currentArchitecture} --publish never --config.extraMetadata.sidekick_dist=prod-mac --config.extraMetadata.sidekick_update=yes`,
        {
          stdio: "inherit",
          cwd: currentFolderPath,
        }
      );
      process.exit(0);

    default:
      console.error(
        `[ Error ] The given build argument '${buildArgumentPlatform}' is not a valid platform. Valid arguments are e.g. --windows, --linux, --mac or --w, --l, --m.`
      );
      process.exit(1);
  }

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

  // packageJSON.__dirname.
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
}
process.exit(0);
