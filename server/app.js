process.env.NODE_CONFIG_DIR = 'server/config';

const chokidar = require('chokidar');
const config = require('config');
const log4js = require('log4js');

const fileEventHandler = require('./controllers/fileEventHandler');

const logger = log4js.getLogger('app');
logger.level = 'debug';

const dirToWatch = config.get('watchDirectory');

logger.info('Starting app');

logger.debug('Creating dir watcher');
// create watcher for the specified directory
const dirWatcher = chokidar.watch(dirToWatch);

// // use chokidar's method chaining to handle add, change and unlink events
dirWatcher
  .on('add', fileEventHandler.handleAdd)
  .on('change', fileEventHandler.handleChange)
  .on('unlink', fileEventHandler.handleUnlink);
