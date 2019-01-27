process.env.NODE_CONFIG_DIR = 'server/config';

const config = require('config');
const chokidar = require('chokidar');
const log4js = require('log4js');
const mongoose = require('mongoose');
const { execFile } = require('child_process');

const fileEventHandler = require('./controllers/fileEventHandler');

const ignoreRegex = /(^|[/\\])\../;

const logger = log4js.getLogger('app');

const dirToWatch = config.get('watchDirectory');
const mongoURI = config.get('mongoURI');

logger.info('Starting app');
logger.debug('Creating dir watcher');

mongoose.connect(mongoURI);

// create watcher for the specified directory
// Should I ignore vi .swp files?
const dirWatcher = chokidar.watch(dirToWatch, { ignored: ignoreRegex });

// get current files uppon start
new Promise((resolve) => {
  execFile('find', [dirToWatch], (err, stdout) => resolve(stdout.split('\n').filter(path => (!path.match(ignoreRegex)) && path.includes('.'))));
}).then((initialFileList) => {
  logger.debug('Refreshing current directory state...');
  fileEventHandler.deleteAllNotIncluded(initialFileList);
});

// use chokidar's method chaining to handle add, change and unlink events
dirWatcher
  .on('add', fileEventHandler.handleChange)
  .on('change', fileEventHandler.handleChange)
  .on('unlink', fileEventHandler.handleUnlink);
