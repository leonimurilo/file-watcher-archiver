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

const getFileMeta = (path, isUnlink) => new Promise((resolve, reject) => {
  if (isUnlink) {
    return resolve({
      name: path.replace(/^.*[\\/]/, ''),
      path,
    });
  }
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
  // handleAdd showed to be useless after I found the upsert option for the 'findOneAndUpdate'
  // But I wont remove it because it may be useful in the future
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

      FileMeta.findOneAndUpdate({ path: meta.path },
        meta,
        {
          upsert: true,
          setDefaultsOnInsert: true
        },
        (err) => {
          if (err) {
            logger.error(err);
            logger.error('An error occured while upserting file meta on mongodb');
          } else {
            logger.info(`Successfuly upserted file ${path} on Mongodb`);
          }
        });
    }).catch(onFileReadError);
  },
  handleUnlink: (path) => {
    logger.debug(`Handling unlink for: ${path}`);
    getFileMeta(path, true).then((meta) => {
      logFileStats(meta);

      FileMeta.findOneAndDelete({ path: meta.path },
        meta,
        (err) => {
          if (err) {
            logger.error(err);
            logger.error('An error occured while deleting file meta from mongodb');
          } else {
            logger.info(`Successfuly deleted file ${path} from Mongodb`);
          }
        });
    }).catch(onFileReadError);
  },
  deleteAllNotIncluded: (list) => {
    logger.debug('Deleting files not included in array...');
    FileMeta.deleteMany({ path: { $nin: list } },
      (err) => {
        if (err) {
          logger.error(err);
          logger.error('An error occured while deleting gone files metas from mongodb');
        } else {
          logger.info('Successfuly deleted gone files from Mongodb');
        }
      });
  }
};
