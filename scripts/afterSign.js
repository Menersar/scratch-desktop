// This script is run by electron-builder after signing the macOS app.
// In addition to code signing, Apple requires that we upload the app for notarization.
// Initially based on: https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

// const {notarize} = require('electron-notarize');
const {notarize} = require('@electron/notarize');
const packageJSON = require('../package.json');

// const notarizeMacBuild = async function (context) {
//     // keep this in sync with appId in the electron-builder config
//     const appId = 'edu.mit.scratch.scratch-desktop';

//     if (!process.env.AC_USERNAME) {
//         console.error([
//             'This build is not notarized and will not run on newer versions of macOS!',
//             'Notarizing the macOS build requires an Apple ID. To notarize future builds:',
//             '* Set the environment variable AC_USERNAME to your@apple.id and',
//             '* Either set AC_PASSWORD or ensure your keychain has an item for "Application Loader: your@apple.id"'
//         ].join('\n'));
//         return;
//     }

//     const appleId = process.env.AC_USERNAME;
//     const appleIdKeychainItem = `Application Loader: ${appleId}`;

//     if (process.env.AC_PASSWORD) {
//         console.log(`Notarizing with Apple ID "${appleId}" and a password`);
//     } else {
//         console.log(`Notarizing with Apple ID "${appleId}" and keychain item "${appleIdKeychainItem}"`);
//     }

//     const {appOutDir} = context;
//     const productFilename = context.packager.appInfo.productFilename;
//     await notarize({
//         appBundleId: appId,
//         appPath: `${appOutDir}/${productFilename}.app`,
//         appleId,
//         appleIdPassword: process.env.AC_PASSWORD || `@keychain:${appleIdKeychainItem}`
//     });
// };

// const afterSign = async function (context) {
//     const {electronPlatformName} = context;

//     switch (electronPlatformName) {
//     case 'mas': // macOS build for Mac App Store
//         break;
//     case 'darwin': // macOS build NOT for Mac App Store
//         await notarizeMacBuild(context);
//         break;
//     }
// };


exports.default = async context => {
    const {electronPlatformName, appOutDir} = context;
    if (electronPlatformName !== 'darwin') {
        console.log('Not notarizing: not macOS');
        return;
    }

    const appleId = process.env.APPLE_ID_USERNAME;
    const appleIdPassword = process.env.APPLE_ID_PASSWORD;
    const teamId = process.env.APPLE_TEAM_ID;
    if (!appleId) {
        console.log('Not notarzing: no APPLE_ID_USERNAME');
        return;
    }
    if (!appleIdPassword) {
        console.log('Not notarzing: no APPLE_ID_PASSWORD');
        return;
    }
    if (!teamId) {
        console.log('Not notarzing: no APPLE_TEAM_ID');
        return;
    }

    console.log('Sending app to Apple for notarization, this will take a while...');
    const appId = packageJSON.build.appId;
    const appPath = `${appOutDir}/${context.packager.appInfo.productFilename}.app`;

    // The intent of this rule no longer applies due to the fact JavaScript now handles native Promises differently.
    // It can now be slower to remove await rather than keeping it.
    // (Source: https://eslint.org/docs/latest/rules/no-return-await)
    // eslint-disable-next-line no-return-await
    return await notarize({
        tool: 'notarytool',
        appBundleId: appId,
        appPath,
        appleId,
        appleIdPassword,
        teamId
    });
};


// module.exports = afterSign;
