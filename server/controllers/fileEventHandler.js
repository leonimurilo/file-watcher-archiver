const log4js = require('log4js');
const fs = require('fs');
const FileMeta = require('../models/FileMeta');

const logger = log4js.getLogger('fileEventHandler');
logger.level = 'debug';

const logFileStats = (meta) => {
  // atime: last access time
  // mtime: last modification time
  // ctime: creation time
  logger.info('=======================================================================================');
  logger.info(`Path: ${meta.path}`);
  logger.debug(`Name: ${meta.name}`);
  logger.debug(`Creation datetime: ${meta.creationDate}`);
  logger.debug(`Last modification datetime: ${meta.modificationDate}`);
  logger.debug(`Size in bytes: ${meta.size}`);
  logger.info('=======================================================================================');
};

const getFileMeta = path => new Promise((resolve, reject) => {
  fs.stat(path, (err, stats) => {
    if (err) {
      logger.error(`Error occured while reading stats for file: ${path}`);
      reject(err);
    }

    if (stats.isFile()) {
      resolve({
        name: path.replace(/^.*[\\/]/, ''),
        path,
        creationDate: stats.ctime,
        modificationDate: stats.mtime,
        size: stats.size,
      });
    }
    reject(new Error('Not a file.'));
  });
});

const onFileReadError = (err) => {
  logger.error(err);
};

module.exports = {
  // This showed to be useless after I found the upsert option for the 'findOneAndUpdate' method
  handleAdd: (path) => {
    logger.debug(`Handling add for: ${path}`);
    getFileMeta(path).then((meta) => {
      logFileStats(meta);

      const newFile = new FileMeta(meta);
      newFile.markModified('object');

      logger.debug('Saving new file on mongodb');

      newFile.save((err) => {
        if (err) {
          logger.error(err);
          logger.error('An error occured while saving file meta on mongodb');
        } else {
          logger.info(`Successfuly saved file ${path} on Mongodb`);
        }
      });
    }).catch(onFileReadError);
  },
  handleChange: (path) => {
    logger.debug(`Handling change for: ${path}`);
    getFileMeta(path).then((meta) => {
      logFileStats(meta);
      FileMeta.findOneAndUpdate({ name: meta.name },
        meta,
        { upsert: true },
        (err) => {
          if (err) {
            logger.error(err);
            logger.error('An error occured while saving file meta on mongodb');
          } else {
            logger.info(`Successfuly updated file ${path} on Mongodb`);
          }
        });
    }).catch(onFileReadError);
  },
  handleUnlink: (path) => {
    logger.debug(`Handling unlink for: ${path}`);
    getFileMeta(path).then((meta) => {
      logFileStats(meta);
    }).catch(onFileReadError);
  }
};
