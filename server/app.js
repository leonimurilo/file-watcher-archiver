process.env.NODE_CONFIG_DIR = 'server/config';

const config = require('config');
const chokidar = require('chokidar');
const log4js = require('log4js');
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const cors = require('cors');
const { execFile } = require('child_process');
const router = require('./router');
const fileEventHandler = require('./controllers/fileEventHandler');
const archiverScheduler = require('./archiverScheduler');

const ignoreRegex = /(^|[/\\])\../;

// use log4js for better logging (with levels and colors)
const logger = log4js.getLogger('app');

// get the params from config files
const dirToWatch = config.get('watchDirectory');
const mongoURI = config.get('mongoURI');

logger.info('Starting app');

// connect to mongo db
logger.info('Connecting to mongo');
mongoose.connect(mongoURI);

// start the job to check for old files (argument is the number of days)
logger.info('Starting archiver job');
archiverScheduler.startJob(null, () => {
  fileEventHandler.archiveOldMetas(5);
});

// create watcher for the specified directory
// Should I ignore vi .swp files?
logger.debug('Creating dir watcher');
const dirWatcher = chokidar.watch(dirToWatch, { ignored: ignoreRegex });

// get current files uppon start
new Promise((resolve) => {
  execFile('find', [dirToWatch], (err, stdout) => resolve(stdout.split('\n').filter(path => (!path.match(ignoreRegex)) && path.includes('.'))));
}).then((initialFileList) => {
  // I had to do this because this is the only way I found to update mongodb collection
  // when the app starts AND some change happened on the directory
  // It basically helps updating the current state on the database when the app starts
  // deleteAllNotIncluded function removes all files that are recorded on mongo but are no longer
  // on the directory
  // while newer files will be added by chokidar's add callback
  logger.debug('Refreshing current directory state...');
  fileEventHandler.deleteAllNotIncluded(initialFileList);
});

// use chokidar's method chaining to handle add, change and unlink events
// I ended up using the same function for add and change after I remembered
// of the upsert option for the mongoose findOneAndUpdate method
dirWatcher
  .on('add', fileEventHandler.handleChange)
  .on('change', fileEventHandler.handleChange)
  .on('unlink', fileEventHandler.handleUnlink);

/**
 * Create Express server.
 */
const app = express();

// allow cors
app.use(cors());

app.use(morgan('combined'));

// setup router for the app
router(app);

// server setup
const port = process.env.PORT || 9999;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
