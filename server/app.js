process.env.NODE_CONFIG_DIR = 'server/config';

const config = require('config');
const chokidar = require('chokidar');
const log4js = require('log4js');
const mongoose = require('mongoose');

const fileEventHandler = require('./controllers/fileEventHandler');

const logger = log4js.getLogger('app');
logger.level = 'info';

const dirToWatch = config.get('watchDirectory');
const mongoURI = config.get('mongoURI');

logger.info('Starting app');
logger.debug('Creating dir watcher');

// create watcher for the specified directory
// Should I ignore vi .swp files?
const dirWatcher = chokidar.watch(dirToWatch);

// // use chokidar's method chaining to handle add, change and unlink events
dirWatcher
  .on('add', fileEventHandler.handleAdd)
  .on('change', fileEventHandler.handleChange)
  .on('unlink', fileEventHandler.handleUnlink);

mongoose.connect(mongoURI, { useNewUrlParser: true }, (err, db) => {
  if (err) {
    logger.error(err);
    logger.error('%s MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
  } else {
    logger.info(`Connected to Mongo: ${mongoURI}`);
    db.close();
  }
});
