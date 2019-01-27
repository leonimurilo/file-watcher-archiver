const log4js = require('log4js');

const logger = log4js.getLogger('app');
logger.level = 'debug';

module.exports = {
  handleAdd: (path) => {
    logger.debug(`Handling add for: ${path}`);
  },
  handleChange: (path) => {
    logger.debug(`Handling change for: ${path}`);
  },
  handleUnlink: (path) => {
    logger.debug(`Handling unlink for: ${path}`);
  }
};
