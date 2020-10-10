import { fastify as createFastify } from 'fastify';
import { AddressInfo } from 'net';
import bootstrap from './bootstrap';
import procurement from './procurement';

const pkg = require('../package.json');
const { config, version } = pkg;
const { logger } = config;

config.version = version;

const fastify = createFastify({ logger });

// Run the server!
const start = async () => {
  const { log: logger } = fastify;
  try {
    await bootstrap(fastify, config);

    (await procurement(fastify, config)).forEach((route) =>
      fastify.route(route)
    );

    await fastify.listen(8080, '0.0.0.0');
    logger.info(
      `server listening on ${(fastify.server.address() as AddressInfo).port}`
    );
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};
start();
