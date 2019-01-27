const { CronJob } = require('cron');

module.exports = {
  startJob: (cronPattern, callback) => {
    let patt = cronPattern;
    if (!cronPattern) {
      patt = '*/30 * * * * *';
    }
    // Every minute as default
    const job = new CronJob(patt, callback);
    job.start();
  }
};
