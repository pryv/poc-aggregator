const app = require('./app');
const config = require('./utils/config.js');
const port = config.get('server:port');
const logger = require('./utils/logging.js');

app.listen(port, () => logger.info(`Pryv Webhook Aggregator listening on port ${port}!`));