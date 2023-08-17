import { app, protocol } from "electron";
import pathUtil from "path";
import { staticDir } from "./environment";
import { canBypassCORS } from "./bypass-cors";

const extensionDirectory = pathUtil.join(
  staticDir,
  "sidekick-extensions.mixality.de",
  "/"
);
// const extensionDirectory = pathUtil.join(staticDir, 'extensions.turbowarp.org', '/');

const ORIGIN = "null";

app.on("session-created", (session) => {
  const rootFileURL = new URL(`file://${__dirname}/`).href;

  // We can only use one onBeforeRequest -- calling it again removes the previous listener.
  session.webRequest.onBeforeRequest(
    {
      // !!! CHANGE !!!
      //   urls: ["file://*", "https://extensions.turbowarp.org/*"],
      // urls: ['file://*', 'https://mixality.github.io/Sidekick/extensions/*']
      urls: ["file://*", "https://menersar.github.io/Sidekick/extensions/*"],
    },
    (details, callback) => {
      const url = new URL(details.url);

      if (url.protocol === "file:") {
        // Prevent file:// URLs from fetching other file:// URLs from outside the app.
        callback({
          cancel: !url.href.startsWith(rootFileURL),
        });
        // !!! CHANGE !!!
        //   } else if (url.origin === "https://extensions.turbowarp.org") {
        // } else if (url.origin === 'https://mixality.github.io/Sidekick/extensions') {
      } else if (
        url.origin === "https://menersar.github.io/Sidekick/extensions"
      ) {
        // Rewrite sidekick-extensions.mixality.de to the offline cache.
        callback({
          redirectURL: `sidekick-extensions://${url.pathname}`,
        });
      } else {
        // !!! 'should'? ???
        // This should never happen.
        callback({});
      }
    }
  );

  // By default, file:// URLs don't send an Origin header. Some websites don't respond with CORS headers
  // if no Origin was given, so we'll make sure to just give one.
  session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({
      requestHeaders: {
        ...details.requestHeaders,
        origin: ORIGIN,
      },
    });
  });

  // By default in Electron, file:// URLs bypass CORS. We enforce it ourselves here.
  session.webRequest.onHeadersReceived((details, callback) => {
    if (details.resourceType === "xhr") {
      const destinationURL = new URL(details.url);
      if (
        destinationURL.protocol === "http:" ||
        destinationURL.protocol === "https:"
      ) {
        let allowed = false;
        if (canBypassCORS()) {
          allowed = true;
        } else {
          const corsHeaders =
            details.responseHeaders?.["access-control-allow-origin"] || [];
          const corsHeader = corsHeaders.join(",");
          allowed = corsHeader === "*" || corsHeader === ORIGIN;
        }

        if (allowed) {
          callback({
            responseHeaders: {
              ...(details.responseHeaders || {}),
              "access-control-allow-origin": "*",
            },
          });
        } else {
          callback({
            cancel: true,
          });
        }

        return;
      }
    }
    callback({});
  });
});

app.whenReady().then(() => {
  protocol.registerFileProtocol("sidekick-extensions", (request, callback) => {
    const pathAndQuery = request.url.substring("sidekick-extensions://".length);
    const path = pathAndQuery.split("?")[0];
    const staticPath = pathUtil.join(extensionDirectory, path);

    if (!staticPath.startsWith(extensionDirectory)) {
      callback({
        statusCode: 404,
      });
      return;
    }

    callback(pathUtil.resolve(staticPath));
  });
});
