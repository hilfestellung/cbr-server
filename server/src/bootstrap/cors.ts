import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import cors from 'fastify-cors';
import { Configuration } from '../Configuration';
import { Tenant } from '../model/Tenant';
import { extractSubdomain } from '../plugins/tenant';

export default async function setup(
  fastify: FastifyInstance,
  _configuration: Configuration
) {
  const logger: FastifyLoggerInstance = fastify.log;
  return fastify.register(cors, {
    origin: (origin: string, done: Function) => {
      if (origin) {
        const subdomain = extractSubdomain(origin);
        let query: any;
        if (subdomain) {
          query = { $or: [{ origins: origin }, { name: subdomain }] };
        } else {
          query = { origins: origin };
        }
        logger.debug({ query }, 'CORS check origin ' + origin);
        Tenant.findOne(query).then((doc) => {
          if (doc) {
            logger.debug('CORS allowed for ' + origin);
            done(null, true);
            return;
          }
          logger.debug('CORS not allowed for ' + origin);
          done(new Error('Forbidden'));
        });
      } else {
        done(new Error('Forbidden'));
      }
    },
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Accept',
      'Accept-Version',
      'Authorization',
      'Content-Type',
      'Origin',
      'X-Trace-Id',
    ],
    maxAge: 300,
    preflightContinue: false,
    preflight: true,
  });
}
