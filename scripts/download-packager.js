const fs = require('fs');
const crypto = require('crypto');
const pathUtil = require('path');
const zlib = require('zlib');
const {fetch} = require('./lib');
const packagerInfo = require('./packager.json');

const path = pathUtil.join(__dirname, '..', 'static', 'packager.html.br');
const foundSha256 = buffer => crypto.createHash('sha256').update(buffer)
    .digest('hex');

const isAlreadyDownloaded = () => {
    try {
        const compressed = fs.readFileSync(path);
        const decompressed = zlib.brotliDecompressSync(compressed);
        if (foundSha256(decompressed) === packagerInfo.sha256) {
            return true;
        }
    } catch (e) {
    // file might not exist, ignore
    }
    return false;
};


if (!isAlreadyDownloaded()) {
    console.log(`Downloading ${packagerInfo.src}`);
    console.time('Download packager');

    fetch(packagerInfo.src)
        .then(res => res.buffer())
        .then(buffer => {
            const newFoundSha256 = crypto.createHash('sha256').update(buffer)
                .digest('hex');
            if (packagerInfo.sha256 !== newFoundSha256) {
                throw new Error(`Hash mismatch: expected ${packagerInfo.sha256} but found ${newFoundSha256}`);
            }
            fs.writeFileSync(path, zlib.brotliCompressSync(buffer));
            console.timeEnd('Download packager');
        })
        .then(() => {
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
} else if (isAlreadyDownloaded()) {
    console.log('Packager already updated');
}
