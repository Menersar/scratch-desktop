/**
 * @overview This script runs `electron-builder` with special management of code signing configuration on Windows.
 * Running this script with no command line parameters should build all targets for the current platform.
 * On Windows, make sure to set CSC_* or WIN_CSC_* environment variables or the NSIS build will fail.
 * On Mac, the CSC_* variables are optional but will be respected if present.
 * See also: https://www.electron.build/code-signing
 */

// ELECTRON-BUILDER INFORMATION
// - Source: https://www.electron.build/
// - Package and build distributable Electron apps for macOS, Windows and Linux (out of the box "auto update" support).
//
// INSTALLATION
// - Recommendation: Yarn (not npm; https://github.com/electron-userland/electron-builder/issues/1147#issuecomment-276284477).
//      yarn add electron-builder --dev
//
// --------------------------------------------------------------------------------------------------
//
// PLATFORM:
// 1. macOS: mac, mac, darwin
// 2. Linux: linux, linux, linux
// 3. Windows: windows, win, win32
//
// TARGET (formats):
// - All platforms: 7z, zip, tar.xz, tar.lz, tar.gz, tar.bz2, dir (unpacked directory).
// 1. macOS: dmg, pkg, mas, mas-dev.
// 2. Linux: AppImage, snap, debian package (deb), rpm, freebsd, pacman, p5p, apk, flatpak(???? echt ???)
// 3. Windows: nsis (Installer), nsis-web (Web installer), portable (portable app without installation), AppX (Windows Store), Squirrel.Windows.
//
// ARCH(itecture):
// - All platforms: x64, ia32, armv7l, arm64, universal
//
// --------------------------------------------------------------------------------------------------
//
// COMMAND LINE INTERFACE (CLI)
// - Help for commands:
//      - Template:
//          --help arg
//      - Example:
//          ./node_modules/.bin/electron-builder install-app-deps --help
//
// TEMPLATE
// - Template:
//      electron-builder --[platform] --[arch] --[target]
// - Example:
//      electron-builder --dir --armv7l --linux deb
//      electron-builder --linux deb:ia32
//
// EXAMPLES
// (run from terminal; not from package.json scripts):
// - build for macOS, Windows and Linux:
//      electron-builder -mwl
// - build deb and tar.xz for Linux:
//      electron-builder --linux deb tar.xz
// - build NSIS 32-bit installer for Windows:
//      electron-builder --windows nsis:ia32
// - set package.json property foo to bar:
//      electron-builder -c.extraMetadata.foo=bar
// - configure unicode options for NSIS:
//      electron-builder -c.nsis.unicode=false
//
// TARGET
// - No target configuration:
//      - Electron app build for current platform, current architecture (using default target).
//          - macOS: DMG and ZIP for Squirrel.Mac.
//          - Windows: NSIS.
//          - Linux: On Windows / macOS: Snap and AppImage for x64, on Linux: Snap and AppImage for current architecture.
// - Configuration of platforms and archs:
//      - Using CLI args (pass e. g. --ia32 and --x64 flags).
//      - In the configuration (build by default NSIS target for all archs for Windows):
//          - package.json: "build": {"win": {"target": [{ "target": "nsis", "arch": ["x64", "ia32"] }]}}
//          - electron-builder.yml: win: target: - target: nsis arch: - x64 - ia32
//              (target: Target name; arch: Arch / list of archs)
//          - And use:
//              build -wl
//
// --------------------------------------------------------------------------------------------------
//
// FILE MACROS
// - Use macros in:
//      - file patterns,
//      - artifact file name patterns
//      - publish configuration url
// - ${arch} — expanded to ia32, x64. If no arch, macro will be removed from your pattern with leading space, - and _ (so, you don’t need to worry and can reuse pattern).
// - ${os} — expanded to mac, linux or win according to target platform.
// - ${platform} — expanded to darwin, linux or win32 according to Node.js process.platform property.
// - ${name} – package.json name.
// - ${productName} — Sanitized product name.
// - ${version}
// - ${channel} — detected prerelease component from version (e.g. beta).
// - ${env.ENV_NAME} — any environment variable.
// - Any property of AppInfo (description = smarten(this.info.metadata.description || ""), version, shortVersion, shortVersionWindows, buildNumber, buildVersion, productName, sanitizedProductName, productFilename, channel, companyName, id, macBundleIdentifier, name, linuxPackageName, sanitizedName, updaterCacheDirName copyright).
//
// --------------------------------------------------------------------------------------------------
//
// AUTO-UPDATABLE TARGETS
// - macOS: DMG.
// - Linux: AppImage.
// - Windows: NSIS.
//
// --------------------------------------------------------------------------------------------------
//
// MULTI PLATFORM BUILD
// - Default:
//      - Build for:
//          - Current platform.
//          - Current arch.
// - CLI flags:
//      - Specify platforms:
//          --mac, --win, --linux
//      - Specify arch:
//          --ia32, --x64
// - Build app for MacOS, Windows and Linux:
//      electron-builder -mwl
//
// --------------------------------------------------------------------------------------------------
//
// ICONS
// - Recommended tools: AppIcon Generator, MakeAppIcon, iConvert Icons.
//
// MACOS
// - Files:
//      - Optional: icon.icns (macOS app icon) or icon.png. Icon size should be at least 512x512.
//      - Optional: background.png (macOS DMG background).
//      - Optional: background@2x.png (macOS DMG Retina background).
//      - Note:
//          - If icon.icns (or icon.png) not provided:
//              - Default Electron icon is used.
// - Directory:
//      - buildResources (defaults to build).
//
// WINDOWS (NSIS)
// - Files:
//      - Optional: icon.ico (Windows app icon) or icon.png.
//      - Note:
//          - If icon.ico (or icon.png) not provided:
//              - Default Electron icon is used.
//      - Size:
//          - At least 256x256.
// - Directory:
//      - buildResources (defaults to build).
//
// LINUX
// - Files:
//      - Icon set generated automatically based on the macOS icns file or common icon.png.
//      - Naming:
//          - Must contain the icon size (e. g. 256x256.png).
//      - Size:
//          - Recommended: 16, 32, 48, 64, 128, 256 (or just 512).
// - Directory:
//      - build/icons
//      - Note:
//          - Used only to specify the icons yourself.
//
// APPX
// - Files:
//      - StoreLogo.png
//      - Square150x150Logo.png
//      - Square44x44Logo.png
//      - Wide310x150Logo.png
//      - Optional: BadgeLogo.png
//      - Optional: LargeTile.png
//      - Optional: SmallTile.png
//      - Optional: SplashScreen.png
//      - Size:
//          - Square150x150Logo.png: 150x150
//          - Square44x44Logo.png: 44x44
//          - Wide310x150Logo.png: 310x150
//          - LargeTile.png: 310x310
//          - SmallTile.png: 71x71
//      - Types:
//          - All official AppX asset types supported by the build process.
//              - Assets can include scaled assets (using target size and scale in the name).
//      - Note:
//          - If Logo, Square150x150Logo, Square44x44Logo and Wide310x150Logo not provided:
//              - Default assets are used.
//          - If optional marked assets not provided:
//              - Will not be listed in the manifest file.
// - Directory:
//      - build/appx
//
// --------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------
//
// BUILDING ELECTRON APP FOR ARM LINUX AND THE RASPBERRY PI
// - Source: https://www.beekeeperstudio.io/blog/electron-apps-for-arm-and-raspberry-pi
//
// - Create deb, rpm snap, and AppImage builds (in THEORY):
//      run yarn run electron:build
//          - AppImage builds WILL work (for both arm64 and armv7l architectures).
//          - The other build will not work.
//
// DEB AND RPM BUILDS FOR ARM
// - Error indicates that electron-builder tries to use an x86 version of FPM.
//      - This is hard coded (D:) (https://github.com/electron-userland/electron-builder/issues/5154) and so does not work on an ARM box.
// - Fix:
//      - Install Ruby, Rubygems and FPM:
//          sudo apt install ruby ruby-dev
//          sudo gem install fpm
//      - Set the (totally undocumented (https://github.com/electron-userland/electron-builder/issues/3901#issuecomment-499121694)) USE_SYSTEM_FPM environment variable to true:
//          USE_SYSTEM_FPM=true yarn run electron-builder build --linux deb rpm --arm64 --armv7l
//
// SNAP BUILDS FOR ARM
// - Error indicates a problem with multipass.
//      - Multipass:
//          - Does not work on most ARM devices.
//          - Is a virtualization package.
//          - Is used by the snapcraft binaryused to build snap packages.
// - Fix:
//      - Set the (also undocumented (https://forum.snapcraft.io/t/the-snapcraft-build-environment-environment-variable/9110)) environment variable SNAPCRAFT_BUILD_ENVIRONMENT to host:
//          export SNAPCRAFT_BUILD_ENVIRONMENT=hostexport USE_SYSTEM_FPM=trueyarn run electron:build --arm64 --armv7l --linux
//              - Tell the snapcraft binary to just build the snap on the local host (not spin up a VM).
//
//  CREATE ALL LINUX ARM PACKAGES
// - Combine all flags together (see: DEB AND RPM BUILDS FOR ARM, SNAP BUILDS FOR ARM):
//      export SNAPCRAFT_BUILD_ENVIRONMENT=hostexport USE_SYSTEM_FPM=true yarn run electron:build --arm64 --armv7l --linux
//      - Results:
//          - Snaps are uploadable to Snapcraft.
//          - Apt and Yum repos are creatable.
//          - AppImages are distributable.
// 
// --------------------------------------------------------------------------------------------------
//
// INSTALL DEB PACKAGE
// - Command:
//      sudo apt-get install ./[filename-linus-armv7l].deb
// - Error: dpkg-deb: error: paste subprocess was killed by signal (Broken pipe)
//      - Fix:
//          - Source: https://askubuntu.com/questions/1062171/dpkg-deb-error-paste-subprocess-was-killed-by-signal-broken-pipe
//              - Press Ctrl + Alt + T
//              - Resolve "trying to overwrite" error (with dpkg) by typing and running:
//                  sudo dpkg -i --force-overwrite /home/sidekick/Desktop/Sidekick/sidekick-desktop/dist/sidekick-3.29.1-linux-armv7l.deb
//              - Fix any broken packages by typing and running:
//                  sudo apt -f install
//                  

const { spawnSync } = require("child_process");
const fs = require("fs");

/**
 * Strip any code signing configuration (CSC) from a set of environment variables.
 * @param {object} environment - a collection of environment variables which might include code signing configuration.
 * @returns {object} - a collection of environment variables which does not include code signing configuration.
 */
const stripCSC = function (environment) {
    const {
        CSC_LINK: _CSC_LINK,
        CSC_KEY_PASSWORD: _CSC_KEY_PASSWORD,
        WIN_CSC_LINK: _WIN_CSC_LINK,
        WIN_CSC_KEY_PASSWORD: _WIN_CSC_KEY_PASSWORD,
        ...strippedEnvironment
    } = environment;
    return strippedEnvironment;
};

/**
 * @returns {string} - an `electron-builder` flag to build for the current platform, based on `process.platform`.
 */
const getPlatformFlag = function () {
    switch (process.platform) {
        case "win32":
            return "--windows";
        case "darwin":
            return "--macos";
        case "linux":
            return "--linux";
    }
    throw new Error(
        `Could not determine platform flag for platform: ${process.platform}`
    );
};
/**
 * Run `electron-builder` once to build one or more target(s).
 * @param {object} wrapperConfig - overall configuration object for the wrapper script.
 * @param {object} target - the target to build in this call.
 * If the `target.name` is `'nsis'` then the environment must contain code-signing config (CSC_* or WIN_CSC_*).
 * If the `target.name` is `'appx'` then code-signing config will be stripped from the environment if present.
 */
const runBuilder = function (wrapperConfig, target) {
    // the AppX build fails if CSC_* or WIN_CSC_* variables are set
    const shouldStripCSC =
        target.name.indexOf("appx") === 0 || !wrapperConfig.doSign;
    const childEnvironment = shouldStripCSC
        ? stripCSC(process.env)
        : process.env;
    if (
        wrapperConfig.doSign &&
        target.name.indexOf("nsis") === 0 &&
        !(childEnvironment.CSC_LINK || childEnvironment.WIN_CSC_LINK)
    ) {
        throw new Error(`Signing NSIS build requires CSC_LINK or WIN_CSC_LINK`);
    }
    const platformFlag = getPlatformFlag();
    let allArgs = [platformFlag, target.name];
    if (target.platform === "darwin") {
        allArgs.push(
            `--c.mac.type=${
                wrapperConfig.mode === "dist" ? "distribution" : "development"
            }`
        );
        if (target.name === "mas-dev") {
            allArgs.push(
                "--c.mac.provisioningProfile=mas-dev.provisionprofile"
            );
        }
        if (wrapperConfig.doSign) {
            // really this is "notarize only if we also sign"
            allArgs.push("--c.afterSign=scripts/afterSign.js");
        } else {
            allArgs.push("--c.mac.identity=null");
        }
    }

    if (target.platform === "linux") {
        allArgs.push(
            `--c.mac.type=${
                wrapperConfig.mode === "dist" ? "distribution" : "development"
            }`
        );
        if (target.name === "armhf:x64") {
            allArgs.push(`--c.mac.provisioningProfile=${masDevProfile}`);
        }
        if (wrapperConfig.doSign) {
            // really this is "notarize only if we also sign"
            allArgs.push("--c.afterSign=scripts/afterSign.js");
        } else {
            allArgs.push("--c.mac.identity=null");
        }
    }

    if (!wrapperConfig.doPackage) {
        allArgs.push("--dir", "--c.compression=store");
    }
    allArgs = allArgs.concat(wrapperConfig.builderArgs);
    console.log(`running electron-builder with arguments: ${allArgs}`);
    const result = spawnSync("electron-builder", allArgs, {
        env: childEnvironment,
        shell: true,
        stdio: "inherit",
    });
    if (result.error) {
        throw result.error;
    }
    if (result.signal) {
        throw new Error(
            `Child process terminated due to signal ${result.signal}`
        );
    }
    if (result.status) {
        throw new Error(`Child process returned status code ${result.status}`);
    }
};

/**
 * @param {object} wrapperConfig - overall configuration object for the wrapper script.
 * @returns {Array.<object>} - the default list of targets on this platform. Each item in the array represents one
 * call to `runBuilder` for exactly one build target. In theory electron-builder can build two or more targets at the
 * same time but doing so limits has unwanted side effects on both macOS and Windows (see function body).
 */
const calculateTargets = function (wrapperConfig) {
    const masDevProfile = "mas-dev.provisionprofile";
    const availableTargets = {
        macAppStore: {
            name: "mas",
            platform: "darwin",
        },
        macAppStoreDev: {
            name: "mas-dev",
            platform: "darwin",
        },
        macDirectDownload: {
            name: "dmg",
            platform: "darwin",
        },
        microsoftStore: {
            name: "appx:ia32 appx:x64",
            platform: "win32",
        },
        windowsDirectDownload: {
            name: "nsis:x64",
            platform: "win32",
        },
        windowsPortable: {
            name: "zip",
            platform: "win32",
        },
        linuxPortable: {
            name: "zip",
            platform: "linux",
        },
        linuxDebPackage: {
            name: "deb",
            platform: "linux",
        },
        linuxRpmPackage: {
            name: "rpm",
            platform: "linux",
        },
        linuxDirectDownload: {
            name: "armhf:x64",
            platform: "linux",
        },
    };
    const targets = [];
    switch (process.platform) {
        case "win32":
            // Run in two passes so we can skip signing the AppX for distribution through the MS Store.
            //targets.push(availableTargets.microsoftStore);
            targets.push(availableTargets.windowsPortable);
            targets.push({ name: "nsis:ia32", platform: "win32" });
            targets.push({ name: "nsis:x64", platform: "win32" });
            break;
        case "linux":
            targets.push(availableTargets.linuxPortable);
            targets.push(availableTargets.linuxDebPackage);
            targets.push(availableTargets.linuxRpmPackage);
            targets.push(availableTargets.linuxDirectDownload);
            break;
        case "darwin":
            // Running 'dmg' and 'mas' in the same pass causes electron-builder to skip signing the non-MAS app copy.
            // Running them as separate passes means they can both get signed.
            // Seems like a bug in electron-builder...
            // Running the 'mas' build first means that its output is available while we wait for 'dmg' notarization.
            // Add macAppStoreDev here to test a MAS-like build locally. You'll need a Mac Developer provisioning profile.
            if (fs.existsSync(masDevProfile)) {
                targets.push(availableTargets.macAppStoreDev);
            } else {
                console.log(
                    `skipping target "${availableTargets.macAppStoreDev.name}": ${masDevProfile} missing`
                );
            }
            if (wrapperConfig.doSign) {
                targets.push(availableTargets.macAppStore);
            } else {
                // electron-builder doesn't seem to support this configuration even if mac.type is "development"
                console.log(
                    `skipping target "${availableTargets.macAppStore.name}" because code-signing is disabled`
                );
            }
            targets.push(availableTargets.macDirectDownload);
            break;
        default:
            throw new Error(
                `Could not determine targets for platform: ${process.platform}`
            );
    }
    return targets;
};

const parseArgs = function () {
    const scriptArgs = process.argv.slice(2); // remove `node` and `this-script.js`
    const builderArgs = [];
    let mode = "dev"; // default

    for (const arg of scriptArgs) {
        const modeSplit = arg.split(/--mode(\s+|=)/);
        if (modeSplit.length === 3) {
            mode = modeSplit[2];
        } else {
            builderArgs.push(arg);
        }
    }

    let doPackage;
    let doSign;

    switch (mode) {
        case "dev":
            doPackage = true;
            doSign = false;
            break;
        case "dir":
            doPackage = false;
            doSign = false;
            break;
        case "dist":
            doPackage = true;
            doSign = true;
    }

    return {
        builderArgs,
        doPackage, // false = build to directory
        doSign,
        mode,
    };
};

const main = function () {
    const wrapperConfig = parseArgs();

    // TODO: allow user to specify targets? We could theoretically build NSIS on Mac, for example.
    wrapperConfig.targets = calculateTargets(wrapperConfig);

    for (const target of wrapperConfig.targets) {
        runBuilder(wrapperConfig, target);
    }
};

main();
