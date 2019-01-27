process.env.NODE_CONFIG_DIR = 'server/config';
const chokidar = require('chokidar');
const config = require('config');

const dirToWatch = config.get('watchDirectory');

// One-liner for current directory, ignores .dotfiles
chokidar.watch(dirToWatch, { ignored: /(^|[/\\])\../ }).on('all', (event, path) => {
  console.log(event, path);
});
