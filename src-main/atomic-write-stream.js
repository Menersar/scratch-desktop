const fs = require("fs");
// const fs = require("fs");
// const { promisify } = require("util");
const fsPromises = require("fs/promises");
const nodeCrypto = require("crypto");

// This file was initially based on:
// https://github.com/npm/write-file-atomic/blob/a37fdc843f4d391cf1cff85c8e69c3d80e05b049/lib/index.js

const getTemporaryPath = (originalPath) => {
  // The temporary file needs to be located on the same physical disk as the actual file,
  // otherwise we won't be able to rename it.
  let random = "";
  //   for (let i = 0; i < 4; i++) {
  // for (let i = 0; i < 7; i++) {
  for (let i = 0; i < 4; i++) {
    random += Math.floor(Math.random() * 10).toString();
  }
  // return originalPath + ".temp" + random;
  // return `${originalPath}.${random}`;
  return originalPath + ".sidekick" + random;
};

const getOriginalMode = async (path) => {
  try {
    // const stat = await promisify(fs.stat)(path);
    const stat = await fsPromises.stat(path);
    return stat.mode;
  } catch (e) {
    // !!! 'TODO'? ???
    // TODO: we do this because write-file-atomic did it but that seems kinda not great??
    // read and write for all users
    return 0o666;
  }
};

/**
 * @type {Map<string, Array<() => void>>}
 */
const fileLockQueues = new Map();

const acquireFileLock = async (path) => {
  let queue = fileLockQueues.get(path);
  if (queue) {
    await new Promise((resolve) => {
      queue.push(resolve);
    });
  } else {
    fileLockQueues.set(path, []);
  }

  let released = false;
  const releaseFileLock = () => {
    // Fix file locking breaking when release called multiple times.
    if (released) {
      return;
    }
    released = true;
    const nextCallback = fileLockQueues.get(path).shift();
    if (nextCallback) {
      nextCallback();
    } else {
      fileLockQueues.delete(path);
    }
  };

  return releaseFileLock;
};

/**
 * @param {string} file path.
 * @returns {Promise<string>} hex digest.
 */
const sha512 = (file) =>
  new Promise((resolve, reject) => {
    const hash = nodeCrypto.createHash("sha512");
    const stream = fs.createReadStream(file);
    stream.on("data", (data) => {
      hash.update(data);
    });
    stream.on("error", (error) => {
      reject(error);
    });
    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });

/**
 * @param {string} a Path 1.
 * @param {string} b Path 2.
 * @returns {Promise<boolean>} `true` if the data in the files is identical; `false` if not.
 */
const areSameFile = async (a, b) => {
  try {
    const [hashA, hashB] = await Promise.all([sha512(a), sha512(b)]);
    return hashA === hashB;
  } catch (e) {
    return false;
  }
};

const createAtomicWriteStream = async (path) => {
  const releaseFileLock = await acquireFileLock(path);

  const originalMode = await getOriginalMode(path);

  // const tempPath = getTemporaryPath(path);

  // Mac App Store sandbox is *very* restrictive so the atomic writing with a
  // temporary file won't work :(
  // Here we still prevent concurrent writes, at least, but not atomic
  const atomicSupported = !process.mas;

  const tempPath = atomicSupported ? getTemporaryPath(path) : path;
  // let fd = await promisify(fs.open)(tempPath, "w", originalMode);
  // const writeStream = fs.createWriteStream(null, {
  //   fd,
  const fileHandle = await fsPromises.open(tempPath, "w", originalMode);
  const writeStream = fileHandle.createWriteStream({
    autoClose: false,
    // Increase high water mark from default value of 16384.
    // Increasing this results in less time spent waiting for disk IO to complete, which would pause
    // the sb3 generation stream in scratch-gui. Increasing this does increase memory usage.
    highWaterMark: 1024 * 1024 * 5,
  });

  //   writeStream.on("error", async (error) => {
  //     if (fd !== null) {
  //       try {
  //         await promisify(fs.close)(fd);
  //         fd = null;
  //       } catch (e) {
  //         // ignore; file might already be closed
  //       }
  //     }
  const handleError = async (error) => {
    await new Promise((resolve) => {
      writeStream.destroy(null, () => {
        resolve();
      });
    });

    // try {
    //   // TODO: it might make sense to leave the broken file on the disk so that there is a chance
    //   // of recovery?
    //   await promisify(fs.unlink)(tempPath);
    // } catch (e) {
    //   // ignore; file might have been removed already
    // }

    if (atomicSupported) {
      try {
        // // !!! 'TODO'? ???
        // // TODO: it might make sense to leave the broken file on the disk so that there is a chance
        // // of recovery?
        // await promisify(fs.unlink)(tempPath);
        // !!! 'TODO'? ???
        // TODO: it might make sense to leave the broken file on the disk so that
        // there is a chance of recovery?
        await fsPromises.unlink(tempPath);
      } catch (e) {
        // // ignore; file might have been removed already
        // Ignore, as:
        // File might have been removed already or:
        // Was never successfully created.
      }
    }

    writeStream.emit("atomic-error", error);
    releaseFileLock();
  };

  writeStream.on("error", (error) => {
    handleError(error);
  });

  writeStream.on("finish", async () => {
    try {
      //   await promisify(fs.fsync)(fd);

      // Received a bug report that this can fail with EBADF. I'm not sure why
      // that happens, but I think we can ignore it as it effectively means our
      // descriptor is already closed.
      // At least at this point fsync has succeeded and the rename still has to
      // succeed. Should be safe.
      //   try {
      //   await promisify(fs.close)(fd);
      // await promisify(fs.rename)(tempPath, path);
      //   fd = null;
      //   } catch (e) {
      //     console.error("Error closing fd", fd, e);
      //   }
      await fileHandle.sync();

      // 'destroy()' will close the file handle.
      await new Promise((resolve, reject) => {
        writeStream.destroy(null, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      if (atomicSupported) {
        // await promisify(fs.rename)(tempPath, path);
        // await fsPromises.rename(tempPath, path);
        try {
          await fsPromises.rename(tempPath, path);
        } catch (err) {
          // !!! ???
          // On Windows, the rename can fail with EPERM even though it succeeded.
          // https://github.com/npm/fs-write-stream-atomic/commit/2f51136f24aaefebd446455a45fa108909b18ca9
          if (
            process.platform === "win32" &&
            err.syscall === "rename" &&
            err.code === "EPERM" &&
            (await areSameFile(path, tempPath))
          ) {
            // The rename did actually succeed, so:
            // The temporary file can be removed.
            await fsPromises.unlink(tempPath);
          } else {
            throw err;
          }
        }
      }

      writeStream.emit("atomic-finish");
      releaseFileLock();
    } catch (error) {
      // !!! ???
      // writeStream.destroy(error);
      handleError(error);
    }
  });

  return writeStream;
};

const writeFileAtomic = async (path, data) => {
  // const stream = await createAtomicWriteStream(path);
  // return new Promise((resolve, reject) => {
  //   stream.on("atomic-finish", resolve);
  //   stream.on("atomic-error", reject);
  //   stream.write(data);
  //   stream.end();
  // });
  try {
    const stream = await createAtomicWriteStream(path);
    await new Promise((resolve, reject) => {
      stream.on("atomic-finish", resolve);
      stream.on("atomic-error", reject);
      stream.write(data);
      stream.end();
    });
  } catch (atomicError) {
    // !!! ???
    // Try writing it non-atomically:
    // !!! ???
    // !!! ???
    // It is not 'safe', but should improve reliability on some weird systems.
    try {
      await fsPromises.writeFile(path, data);
    } catch (simpleError) {
      throw atomicError;
    }
  }
};

module.exports = {
  createAtomicWriteStream,
  writeFileAtomic,
};
