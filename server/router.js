const fileEventHandler = require('./controllers/fileEventHandler');

module.exports = (app) => {
  // I should have used query params and only one controller function for this
  // the params would have been used as filters on the query
  // However I am following the instructions
  app.get('/', (req, res) => res.status(200).send({ ok: true }));
  app.get('/files/archived', fileEventHandler.getArchivedMetas);
  app.get('/files/active', fileEventHandler.getActiveMetas);
};
