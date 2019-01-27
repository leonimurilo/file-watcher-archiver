const log4js = require('log4js');
const fs = require('fs');

const logger = log4js.getLogger('fileEventHandler');
logger.level = 'debug';

module.exports = {
  handleAdd: (path) => {
    logger.debug(`Handling add for: ${path}`);
  },
  handleChange: (path) => {
    logger.debug(`Handling change for: ${path}`);
    fs.stat(path, (err, stats) => {
      if (err) {
        logger.error(`Error occured while reading stats for file: ${path}`);
        logger.error(err);
        return;
      }
      // atime: last access time
      // mtime: last modification time
      // ctime: creation time
      if (stats.isFile()) {
        logger.info('=======================================================================================');
        logger.info(`Path: ${path}`);
        logger.info(`Name: ${path.replace(/^.*[\\/]/, '')}`);
        logger.info(`Creation datetime: ${stats.ctime}`);
        logger.info(`Last modification datetime: ${stats.mtime}`);
        logger.info(`Size in bytes: ${stats.size}`);
        logger.debug(JSON.stringify(stats));
        logger.info('=======================================================================================');
      }
    });
  },
  handleUnlink: (path) => {
    logger.debug(`Handling unlink for: ${path}`);
  }
};
