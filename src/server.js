const app = require('./app');

app.listen(port, () => logger.info(`Pryv Webhook Aggregator listening on port ${port}!`));