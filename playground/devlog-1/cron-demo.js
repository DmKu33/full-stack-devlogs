const { CronJob } = require('cron');

const job = new CronJob('*/10 * * * *', function() {
    console.log('Cron job executed:', new Date().toLocaleString());
});

job.start();
