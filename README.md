# scratch-desktop

npm install
npm run fetch
npm run webpack:prod
electron:package:dir

## Packager

Standalone download under:
scripts\packager.json

Scratch 3.0 as a standalone desktop application

## Developer Instructions

### Releasing a new version

Let's assume that you want to make a new release, version `3.999.0`, corresponding to `scratch-gui` version
`0.1.0-prerelease.20yymmdd`.

1. Merge `scratch-gui`:
   1. `cd scratch-gui`
   2. `git pull --all --tags`
   3. `git checkout scratch-desktop`
   4. `git merge 0.1.0-prerelease.20yymmdd`
   5. Resolve conflicts if necessary
   6. `git tag scratch-desktop-v3.999.0`
   7. `git push`
   8. `git push --tags`
2. Prep `scratch-desktop`:
   1. `cd scratch-desktop`
   2. `git pull --all --tags`
   3. `git checkout develop`
   4. `npm install --save-dev 'scratch-gui@github:LLK/scratch-gui#scratch-desktop-v3.999.0'`
   5. `git add package.json package-lock.json`
   6. Make sure the app works, the diffs look reasonable, etc.
   7. `git commit -m "bump scratch-gui to scratch-desktop-v3.999.0"`
   8. `npm version 3.999.0`
   9. `git push`
   10. `git push --tags`
3. Wait for the CI build and collect the release from the build artifacts

### A note about `scratch-gui`

Eventually, the `scratch-desktop` branch of the Scratch GUI repository will be merged with that repository's main
development line. For now, though, the `scratch-desktop` branch holds a few changes that are necessary for the Scratch
app to function correctly but are not yet merged into the main development branch. If you only intend to build or work
on the `scratch-desktop` repository then you can ignore this, but if you intend to work on `scratch-gui` as well, make
sure you use the `scratch-desktop` branch there.

Previously it was necessary to explicitly build `scratch-gui` before building `scratch-desktop`. This is no longer
necessary and the related build scripts, such as `build-gui`, have been removed.

### Prepare media library assets

In the `scratch-desktop` directory, run `npm run fetch`. Re-run this any time you update `scratch-gui` or make any
other changes which might affect the media libraries.

### Run in development mode

`npm start`

### Make a packaged build

`npm run dist`

Node that on macOS this will require installing various certificates.

#### Signing the NSIS installer (Windows, non-store)

*This section is relevant only to members of the Scratch Team.*

By default all Windows installers are unsigned. An APPX package for the Microsoft Store shouldn't be signed: it will
be signed automatically as part of the store submission process. On the other hand, the non-Store NSIS installer
should be signed.

To generate a signed NSIS installer:

1. Acquire our latest digital signing certificate and save it on your computer as a `p12` file.
2. Set `WIN_CSC_LINK` to the path to your certificate file. For maximum compatibility I use forward slashes.
   - CMD: `set WIN_CSC_LINK=C:/Users/You/Somewhere/Certificate.p12`
   - PowerShell: `$env:WIN_CSC_LINK = "C:/Users/You/Somewhere/Certificate.p12"`
3. Set `WIN_CSC_KEY_PASSWORD` to the password string associated with your P12 file.
   - CMD: `set WIN_CSC_KEY_PASSWORD=superSecret`
   - PowerShell: `$env:WIN_CSC_KEY_PASSWORD = "superSecret"`
4. Build the NSIS installer only: building the APPX installer will fail if these environment variables are set.
   - `npm run dist -- -w nsis`

#### Workaround for code signing issue in macOS

Sometimes the macOS build process will result in a build which crashes on startup. If this happens, check in `Console`
for an entry similar to this:

```text
failed to parse entitlements for Scratch[12345]: OSUnserializeXML: syntax error near line 1
```

This appears to be an issue with `codesign` itself. Rebooting your computer and trying to build again might help. Yes,
really.

See this issue for more detail: <https://github.com/electron/electron-osx-sign/issues/218>

### Make a semi-packaged build

This will simulate a packaged build without actually packaging it: instead the files will be copied to a subdirectory
of `dist`.

`npm run dist:dir`

### Debugging

You can debug the renderer process by opening the Chromium development console. This should be the same keyboard
shortcut as Chrome on your platform. This won't work on a packaged build.

You can debug the main process the same way as any Node.js process. I like to use Visual Studio Code with a
configuration like this:

```jsonc
    "launch": {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Desktop",
                "type": "node",
                "request": "launch",
                "cwd": "${workspaceFolder:scratch-desktop}",
                "runtimeExecutable": "npm",
                "autoAttachChildProcesses": true,
                "runtimeArgs": ["start", "--"],
                "protocol": "inspector",
                "skipFiles": [
                    // it seems like skipFiles only reliably works with 1 entry :(
                    //"<node_internals>/**",
                    "${workspaceFolder:scratch-desktop}/node_modules/electron/dist/resources/*.asar/**"
                ],
                "sourceMaps": true,
                "timeout": 30000,
                "outputCapture": "std"
            }
        ]
    },
```

### Resetting the Telemetry System

This application includes a telemetry system which is only active if the user opts in. When testing this system, it's
sometimes helpful to reset it by deleting the `telemetry.json` file.

The location of this file depends on your operating system and whether or not you're running a packaged build. Running
from `npm start` or equivalent is a non-packaged build.

In addition, macOS may store the file in one of two places depending on the OS version and a few other variables. If
in doubt, I recommend removing both.

- Windows, packaged build: `%APPDATA%\Scratch\telemetry.json`
- Windows, non-packaged: `%APPDATA%\Electron\telemetry.json`
- macOS, packaged build: `~/Library/Application Support/Scratch/telemetry.json` or
  `~/Library/Containers/edu.mit.scratch.scratch-desktop/Data/Library/Application Support/Scratch/telemetry.json`
- macOS, non-packaged build: `~/Library/Application Support/Electron/telemetry.json` or
  `~/Library/Containers/edu.mit.scratch.scratch-desktop/Data/Library/Application Support/Electron/telemetry.json`

Deleting this file will:

- Remove any pending telemetry packets
- Reset the opt in/out state: the app should display the opt in/out modal on next launch
- Remove the random client UUID: the app will generate a new one on next launch

### Building the application

#### Develompent builds

Clone the `sidekick-desktop` repository into a folder `sidekick-desktop` by running:

``` console
<!-- !!! CHANGE !!! -->
git clone --recursive https://github.com/Menersar/sidekick-desktop sidekick-desktop
```

OR (alternatively) run:

``` console
<!-- !!! CHANGE !!! -->
git clone https://github.com/Menersar/sidekick-desktop sidekick-desktop
git submodule init
git submodule update
```

Install dependencies via the following command:

``` console
npm ci
```

Fetch extra library, packager, and extension files by running:

``` console
npm run fetch
```

To build the webpack portions in src-renderer-webpack for development builds, run this:

``` console
npm run webpack:compile
```

You can also run this instead for source file changes to immediately trigger rebuilds:

``` console
npm run webpack:watch
```

If everything is compiled and fetched, the application can be packaged up for Electron.
For development, start a development Electron instance by running:

``` console
npm run electron:start
```

Linux note: The app icon won't work in the development version, but it will work in the packaged version.

Development can work well by opening two terminals side-by-side, run `npm run webpack:watch` in one and `npm run electron:start` in the other.
Refresh the windows with `Ctrl` + `R` or `Cmd` + `R` to apply renderer file changes, manually restart the app to apply main file changes.

#### Production-ready builds

The development version of the app will be larger and slower than the final release builds.

Build an optimized version of the webpack portions with:

``` console
npm run webpack:prod
```

Then to package up the final Electron binaries, use the electron-builder CLI. They will be saved in the dist folder. Some examples:

``` console
# Windows installer

npx electron-builder --windows nsis --x64

# macOS DMG

npx electron-builder --mac dmg --universal

# Linux Debian

npx electron-builder --linux deb
```

<!-- !!! CHANGE !!! -->
More examples in the [release script](https://github.com/Menersar/sidekick-desktop/blob/sidekick/.github/workflows/release.yml). You can typically only package for a certain operating system while on that operating system.

It is possible to give each packaged version of the app a unique distribution ID to help uniquely identify them – it appears in the "About" window.
Add `--config.extraMetadata.sidekick_dist=your-dist-id-here` to electron-builder's arguments to set the distribution ID. Additionally, to enable the in-app update checker, also add `--config.extraMetadata.tw_update=yes`.

## 'packagerInfo' file

file location:

- `scripts/packager.json`

src:

- <https://github.com/Menersar/sidekick-packager/releases>
- <https://github.com/Menersar/sidekick-packager/releases/download/v0.1.0/sidekick-packager-standalone-v0.1.0.html>

sha256:

- npm run build-standalone-prod
- Scaffolding build ID
