import {
  fastify as createFastify,
  FastifyRequest,
  RouteOptions,
} from 'fastify';
import { AddressInfo } from 'net';

import cors from 'fastify-cors';
import compress from 'fastify-compress';
import tracing from '@hilfestellung/fastify-tracing';

import tenant, { TenantInformation } from './plugins/fastify-tenant';
import jwksJwt from './plugins/fastify-jwks-rsa-jwt-verify';
import jwksClient from 'jwks-rsa';
import { connect } from 'mongoose';
import { Tenant } from './model/tenant/Tenant';
import routes from './api/routes';
import { User } from './model/User';

const fastify = createFastify({ logger: { level: 'debug' } });

const opt: any = {
  configProvider: (_tenant: TenantInformation) => {
    return Promise.resolve({
      strictSsl: true, // Default value
      jwksUri: 'https://cdein.eu.auth0.com/.well-known/jwks.json',
      requestHeaders: {}, // Optional
      timeout: 30000, // Defaults to 30s
    } as jwksClient.ClientOptions);
  },
  complete: (subject: string, _audience: string, request: FastifyRequest) => {
    return User.findOne({
      subject,
      tenant: request.tenant.name,
    })
      .then((doc) => doc?.toObject())
      .then((user) => {
        if (user != null) {
          return user;
        }
        const newUser: any = { subject, tenant: request.tenant.name };
        return User.find()
          .limit(1)
          .then((docs) => {
            if (docs.length === 0) {
              // Create the first user as a super user.
              newUser.permissions = ['super'];
            }
            request.log.debug({ newUser }, 'New user ' + subject);
            return new User(newUser).save().then((doc) => doc.toObject());
          });
      });
  },
};

connect('mongodb://mongo/cbr', {
  authSource: 'admin',
  auth: { user: 'root', password: process.env.DATABASE_PASSWORD as string },
})
  .then(() => console.log('MongoDB connected…'))
  .catch((err) => console.log(err));

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
fastify.register(tenant, {
  tenantResolver: (tenantId) => {
    let tenant = tenantId;
    if (['case-based-reasoning', 'localhost'].includes(tenant)) {
      tenant = 'cbr';
    }
    return Tenant.findOne({ name: tenant }).then((doc) => doc?.toObject());
  },
});
fastify.register(jwksJwt, opt);

// Declare a routes
routes.forEach((route) => fastify.route(route as RouteOptions));

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
