/**
 * Partial reimplementation of the FileSystem API
 * https://web.dev/file-system-access/
 */

import {ipcRenderer} from 'electron';

const getBasename = path => {
    const match = path.match(/([^/\\]+)$/);
    if (!match) return null;
    return match[1];
};

// !!! 'Missing JSDoc return description. eslint(valid-jsdoc)'? ???
// !!! 'Missing JSDoc parameter description for 'contents'. eslint (valid-jsdoc)'? ???
/**
 * @param {unknown} contents
 * @returns {Uint8Array}
 */
const toUnit8Array = contents => {
    if (contents instanceof Uint8Array) {
        return contents;
    }
    if (contents instanceof Blob) {
        throw new Error('Should never receive a Blob here.');
    }
    return new Uint8Array(contents);
};

class WrappedFileWritable {
    /**
   * @param {string} path The path on disk we are writing to.
   */
    constructor (path) {
        this._path = path;

        this._channel = new MessageChannel();

        /**
     * @type {Map<number, {resolve: () => void, reject: (error: unknown) => void}>}
     */
        this._callbacks = new Map();
        this._lastMessageId = 1;

        /**
     * Error object from the main process, if any.
     * @type {unknown}
     */
        this._error = null;

        this._channel.port1.onmessage = event => {
            const data = event.data;

            const error = data.error;
            if (error) {
                this._error = error;
                for (const handlers of this._callbacks.values()) {
                    handlers.reject(error);
                }
                this._callbacks.clear();
            }

            const response = data.response;
            if (response) {
                const id = response.id;
                const handlers = this._callbacks.get(id);
                if (handlers) {
                    handlers.resolve(response.result);
                    this._callbacks.delete(id);
                }
            }
        };

        // Note that we don't need to wait for the other end before we can start sending data. The messages
        // will just be queued up.
        // preload.js will detect this message event and forward it to the main process
        window.postMessage({
            ipcPostMessagePassthrough: {
                channel: 'write-file-with-port',
                data: this._path
            }
        }, location.origin, [this._channel.port2]);
    }

    _sendToMainAndWait (message) {
        if (this._error) {
            throw this._error;
        }

        const messageId = this._lastMessageId++;
        message.id = messageId;
        return new Promise((resolve, reject) => {
            this._callbacks.set(messageId, {
                resolve,
                reject
            });
            this._channel.port1.postMessage(message);
        });
    }

    async write (contents) {
        await this._sendToMainAndWait({
            write: toUnit8Array(contents)
        });
    }

    async close () {
        await this._sendToMainAndWait({
            finish: true
        });
    }

    async abort () {
        await this._sendToMainAndWait({
            abort: true
        });
    }
}

export class WrappedFileHandle {
    constructor (path) {
    // non-standard, used internally and by DesktopComponent
        this.path = path;
        // part of public API
        this.name = getBasename(this.path);
    }

    async getFile () {
        const data = await ipcRenderer.invoke('read-file', this.path);
        return new File([data], this.name);
    }

    async createWritable () {
        return new WrappedFileWritable(this.path);
    }
}

class AbortError extends Error {
    constructor (message) {
        super(message);
        this.name = 'AbortError';
    }
}

/*
Input:
[
  {
    description: 'Scratch 3 Project',
    accept: {
      'application/x.scratch.sb3': ['.sb', '.sb2', '.sb3'] <-- could also be just a string
    }
  }
]

Output:
[
  {
    name: 'Scratch 3 Project',
    extensions: ['sb', 'sb2', 'sb3']
  }
]
*/
const typesToFilterList = types => types.map(type => ({
    name: type.description,
    extensions: Object.values(type.accept)
        .flat()
        .map(i => i.substr(1))
}));

window.showSaveFilePicker = async options => {
    const result = await ipcRenderer.invoke('show-save-dialog', {
        filters: typesToFilterList(options.types),
        suggestedName: options.suggestedName
    });

    if (result.canceled) {
        throw new AbortError('Operation was cancelled by user.');
    }

    const filePath = result.filePath;
    return new WrappedFileHandle(filePath);
};

window.showOpenFilePicker = async options => {
    const result = await ipcRenderer.invoke('show-open-dialog', {
        filters: typesToFilterList(options.types)
    });

    if (result.canceled) {
        throw new AbortError('Operation was cancelled by user.');
    }

    const [filePath] = result.filePaths;
    return [new WrappedFileHandle(filePath)];
};
