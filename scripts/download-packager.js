const fs = require("fs");
const crypto = require("crypto");
const pathUtil = require("path");
// const zlib = require("zlib");
const { fetch } = require("./lib");
const packagerInfo = require("./packager.json");

const path = pathUtil.join(
  __dirname,
  "../src-renderer/packager/standalone.html"
);
const foundSha256 = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

const isAlreadyDownloaded = () => {
  try {
    const data = fs.readFileSync(path);
    return foundSha256(data) === packagerInfo.sha256;
  } catch (e) {
    // file might not exist, ignore
  }
  return false;
};

if (!isAlreadyDownloaded()) {
  console.log(`Downloading ${packagerInfo.src}`);
  console.time("Download packager");

  fetch(packagerInfo.src)
    .then((res) => res.buffer())
    .then((buffer) => {
      const newFoundSha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      if (packagerInfo.sha256 !== newFoundSha256) {
        throw new Error(
          `Hash mismatch: expected ${packagerInfo.sha256} but found ${newFoundSha256}`
        );
      }
      fs.mkdirSync(pathUtil.dirname(path), {
        recursive: true,
      });
      fs.writeFileSync(path, buffer);
    //   console.timeEnd("Download packager");
    })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
// } else if (isAlreadyDownloaded()) {
} else {
  console.log("Packager already updated");
}
