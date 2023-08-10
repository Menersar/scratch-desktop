import {app, ipcMain} from 'electron';
import {version} from '../../package.json';

ipcMain.handle('get-debug-info', () => ({
    version: version,
    env: process.env.NODE_ENV || 'development',
    platform: process.platform,
    arch: process.arch,
    electron: process.versions.electron,
    // !!!!
    // !!! '!!'? ???
    // !!!!!HERE!!!!!
    // !! converts `undefined` reported in Linux to false.
    runningUnderTranslation: !!app.runningUnderARM64Translation
}));
