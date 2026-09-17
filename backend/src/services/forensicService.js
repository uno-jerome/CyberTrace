const fs = require('fs');
const crypto = require('crypto');

const computeFileHashes = (filePath) => {
  return new Promise((resolve, reject) => {
    const sha256Hash = crypto.createHash('sha256');
    const md5Hash = crypto.createHash('md5');

    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      sha256Hash.update(chunk);
      md5Hash.update(chunk);
    });

    stream.on('end', () => {
      resolve({
        sha256: sha256Hash.digest('hex'),
        md5: md5Hash.digest('hex'),
      });
    });

    stream.on('error', (err) => {
      reject(new Error(`Failed to hash file at "${filePath}": ${err.message}`));
    });
  });
};

const computeSHA256 = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(new Error(`Failed to compute SHA-256 for "${filePath}": ${err.message}`));
    });
  });
};

module.exports = { computeFileHashes, computeSHA256 };
