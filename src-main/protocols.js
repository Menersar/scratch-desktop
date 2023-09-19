const path = require("path");
const zlib = require("zlib");
const fs = require("fs");
// const { promisify } = require("util");
// const { app, protocol } = require("electron");
const { app, protocol, net } = require("electron");

// const readFile = promisify(fs.readFile);
// const brotliDecompress = promisify(zlib.brotliDecompress);

const FILE_SCHEMES = {
  "sidekick-editor": {
    root: path.resolve(__dirname, "../dist-renderer-webpack/editor"),
    standard: true,
    supportFetch: true,
    secure: true,
  },
  "sidekick-desktop-settings": {
    root: path.resolve(__dirname, "../src-renderer/desktop-settings"),
  },
  "sidekick-privacy": {
    root: path.resolve(__dirname, "../src-renderer/privacy"),
  },
  "sidekick-about": {
    root: path.resolve(__dirname, "../src-renderer/about"),
  },
  "sidekick-packager": {
    root: path.resolve(__dirname, "../src-renderer/packager"),
    standard: true,
    secure: true,
  },
  "sidekick-library": {
    root: path.resolve(__dirname, "../dist-library-files"),
    supportFetch: true,
    brotli: true,
  },
  "sidekick-extensions": {
    root: path.resolve(__dirname, "../dist-extensions"),
    supportFetch: true,
  },
  "sidekick-update": {
    root: path.resolve(__dirname, "../src-renderer/update"),
  },
};

const MIME_TYPES = new Map();
MIME_TYPES.set(".wav", "audio/wav");
MIME_TYPES.set(".svg", "image/svg+xml");
MIME_TYPES.set(".png", "image/png");

protocol.registerSchemesAsPrivileged(
  Object.entries(FILE_SCHEMES).map(([scheme, metadata]) => ({
    scheme,
    privileges: {
      standard: !!metadata.standard,
      supportFetchAPI: !!metadata.supportFetch,
      secure: !!metadata.secure,
    },
  }))
);

app.whenReady().then(() => {
  for (const [scheme, metadata] of Object.entries(FILE_SCHEMES)) {
    // Forcing a trailing / slightly improves security of the path traversal check later.
    const root = path.join(metadata.root, "/");

    // if (metadata.brotli) {
    //   protocol.registerBufferProtocol(scheme, (request, callback) => {
    //     const url = new URL(request.url);
    //     const resolved = path.join(root, `${url.pathname}.br`);
    protocol.handle(scheme, async (request) => {
      const url = new URL(request.url);
      const resolved = path.join(root, url.pathname);
      if (!resolved.startsWith(root)) {
        return new Response("not found", {
          status: 404,
        });
      }

      if (metadata.brotli) {
        const fileExtension = path.extname(url.pathname);

        // if (!resolved.startsWith(root) || !MIME_TYPES.has(fileExtension)) {
        //   callback({
        //     statusCode: 404,
        const mimeType = MIME_TYPES.get(fileExtension);
        if (!mimeType) {
          return new Response("not found", {
            status: 404,
          });
          //   return;
          // }

          // readFile(resolved)
          //   .then((compressed) => brotliDecompress(compressed))
          //   .then((decompressed) => {
          //     callback({
          //       data: decompressed,
          //       mimeType: MIME_TYPES.get(fileExtension),
          //     });
          //   })
          //   .catch((error) => {
          //     console.error(error);
          //     callback({
          //       statusCode: 404,
          //     });
        }

        // Would be best if we could somehow stream this (ideally using
        // Content-Encoding: br), but that doesn't seem to work very easily
        // right now.
        const compressed = await new Promise((resolve, reject) => {
          fs.readFile(`${resolved}.br`, (error, data) => {
            if (error) {
              reject(error);
            } else {
              resolve(data);
            }
          });
        });

        // } else {
        //   protocol.registerFileProtocol(scheme, (request, callback) => {
        //     // Don't need to check mime types ourselves as Electron will do it for us.
        //     const url = new URL(request.url);
        //     const resolved = path.join(root, url.pathname);
        //     if (resolved.startsWith(root)) {
        //       callback(resolved);
        const decompressed = await new Promise((resolve, reject) => {
          zlib.brotliDecompress(compressed, (error, result) => {
            if (error) {
              reject(error);
            } else {
              //   callback({
              //     statusCode: 404,
              //   });
              resolve(result);
            }
          });
        });

        return new Response(decompressed, {
          headers: {
            "Content-Type": mimeType,
          },
        });
      }

      // net.fetch is probably more efficient than reading the entire file
      // into memory at once.
      return net.fetch(`file://${resolved}`);
    });
  }
});
