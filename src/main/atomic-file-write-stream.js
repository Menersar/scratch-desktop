import fs from "fs";
import { promisify } from "util";

// This file was initially based on:
// https://github.com/npm/write-file-atomic/blob/a37fdc843f4d391cf1cff85c8e69c3d80e05b049/lib/index.js

const getTemporaryPath = (originalPath) => {
  // The temporary file needs to be located on the same physical disk as the actual file,
  // otherwise we won't be able to rename it.
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += Math.floor(Math.random() * 10).toString();
  }
  //   return `${originalPath}.sidekick${random}`;
  return originalPath + ".sidekick" + random;
};

const getOriginalMode = async (path) => {
  try {
    const stat = await promisify(fs.stat)(path);
    return stat.mode;
  } catch (e) {
    // read and write for all users
    return 0o666;
  }
};

/**
 * @type {Map<string, Array<() => void>>}
 */
const fileLockQueues = new Map();

const acquireFileLock = async (path) => {
  //   const queue = fileLockQueues.get(path);
  let queue = fileLockQueues.get(path);
  if (queue) {
    await new Promise((resolve) => {
      queue.push(resolve);
    });
  } else {
    fileLockQueues.set(path, []);
  }

  const releaseFileLock = () => {
    const nextCallback = fileLockQueues.get(path).shift();
    if (nextCallback) {
      nextCallback();
    } else {
      fileLockQueues.delete(path);
    }
  };

  return releaseFileLock;
};

const createAtomicWriteStream = async (path) => {
  const releaseFileLock = await acquireFileLock(path);

  const originalMode = await getOriginalMode(path);

  const tempPath = getTemporaryPath(path);
  const fd = await promisify(fs.open)(tempPath, "w", originalMode);
  const writeStream = fs.createWriteStream(null, {
    fd,
    autoClose: false,
    // Increase high water mark from default value of 16384.
    // Increasing this results in less time spent waiting for disk IO to complete, which would pause
    // the sb3 generation stream in scratch-gui. Increasing this does increase memory usage.
    highWaterMark: 1024 * 1024 * 5,
  });

  writeStream.on("error", async (error) => {
    try {
      await promisify(fs.close)(fd);
    } catch (e) {
      // ignore; file might already be closed
    }

    try {
      // !!! 'TODO'? ???
      // TODO: it might make sense to leave the broken file on the disk so that there is a chance
      // of recovery?
      await promisify(fs.unlink)(tempPath);
    } catch (e) {
      // ignore; file might have been removed already
    }

    // !!! 'atomic-error'? ???
    writeStream.emit("atomic-error", error);
    releaseFileLock();
  });

  writeStream.on("finish", async () => {
    try {
      await promisify(fs.fsync)(fd);
      await promisify(fs.close)(fd);
      await promisify(fs.rename)(tempPath, path);
      writeStream.emit("atomic-finish");
      releaseFileLock();
    } catch (error) {
      writeStream.destroy(error);
    }
  });

  return writeStream;
};

const writeFileAtomic = async (path, data) => {
  const stream = await createAtomicWriteStream(path);
  return new Promise((resolve, reject) => {
    stream.write(data);
    stream.on("atomic-finish", resolve);
    stream.on("atomic-error", reject);
    stream.end();
  });
};

export { createAtomicWriteStream, writeFileAtomic };
