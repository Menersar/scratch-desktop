// // The version of Electron we use does not yet support fetch().

// const http = require("http");
// const https = require("https");
// const { version } = require("../package.json");
const { name, version } = require("../package.json");

/**
 * Fetch any URL without care for CORS.
 * @param {string} url
 * @returns {Promise<Response>} Rejects if status was not okay.
 */
// const privilegedFetchAsBuffer = (url) =>
const privilegedFetch = (url) => {
  //   new Promise((resolve, reject) => {
  //     const parsedURL = new URL(url);
  //     const mod = parsedURL.protocol === "http:" ? http : https;
  //     const request = mod.get(url, {
  // Don't use Electron's net.fetch because we don't want to be affected by the
  // networking stack which would include our request filtering, and we have no
  // reason for this to be able to fetch file:// URLs.
  return fetch(url, {
    headers: {
      // "user-agent": `sidekick-desktop/${version}`,
      "User-Agent": `${name}/${version}`,
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP Error while fetching ${url}: ${res.status}`);
    }
    return res;
  });
};

//     request.on("response", (response) => {
//       const statusCode = response.statusCode;
//       if (statusCode !== 200) {
//         reject(new Error(`HTTP status ${statusCode}`));
//         return;
//       }

//       let chunks = [];
//       response.on("data", (chunk) => {
//         chunks.push(chunk);
//       });

//       response.on("end", () => {
//         resolve(Buffer.concat(chunks));
//       });
//     });

//     request.on("error", (e) => {
//       reject(e);
//     });
//   });

// module.exports = privilegedFetchAsBuffer;
module.exports = privilegedFetch;
