import {
  fastify as createFastify,
  FastifyRequest,
  FastifyReply,
  RegisterOptions,
} from 'fastify';
import { AddressInfo } from 'net';

import cors from 'fastify-cors';
import compress from 'fastify-compress';
import tracing from '@hilfestellung/fastify-tracing';

import tenant from './plugins/fastify-tenant';
import jwksJwt from './plugins/fastify-jwks-rsa-jwt-verify';
import jwksClient from 'jwks-rsa';

const fastify = createFastify({ logger: { level: 'debug' } });

const opt: any = {
  configProvider: (_tenant: string) => {
    return Promise.resolve({
      strictSsl: true, // Default value
      jwksUri: 'https://cdein.eu.auth0.com/.well-known/jwks.json',
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    } as jwksClient.ClientOptions);
  },
} as RegisterOptions;

fastify.register(tracing);
fastify.register(compress);
fastify.register(cors, {
  origin: [
    'https://case-based-reasoning.org',
    'https://www.case-based-reasoning.org',
    'https://ui.case-based-reasoning.org',
    'http://localhost:3000',
  ],
  methods: 'GET,PUT,POST,DELETE,OPTIONS',
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'Origin',
    'X-Trace-Id',
  ],
  maxAge: 300,
  preflightContinue: false,
  preflight: true,
});
fastify.register(tenant, {});
fastify.register(jwksJwt, opt);

// Declare a route
fastify.get('/', async (request: FastifyRequest, _reply: FastifyReply) => {
  return {
    hello: 'my docker world',
    user: (request as any).user,
    headers: request.headers,
  };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8080, '0.0.0.0');
    fastify.log.info(
      `server listening on ${(fastify.server.address() as AddressInfo).port}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
