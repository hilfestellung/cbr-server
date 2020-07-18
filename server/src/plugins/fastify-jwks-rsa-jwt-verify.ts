import fp from 'fastify-plugin';
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { verify, decode } from 'jsonwebtoken';

import jwksClient from 'jwks-rsa';

export interface ConfigProviderFn {
  (tenant: string): Promise<jwksClient.ClientOptions>;
}

export interface JwksJwtOptions {
  configProvider: ConfigProviderFn;
  complete?: (subject: string, audience: string) => Promise<object>;
}

const cache: any = {};

async function getClient(
  host: string,
  configProvider: ConfigProviderFn
): Promise<jwksClient.JwksClient> {
  const tenantMatcher = /(\w+)\..*/gi.exec(host);
  const tenant = tenantMatcher ? tenantMatcher[1] : 'default';
  if (!cache[tenant]) {
    cache[tenant] = jwksClient(await configProvider(tenant));
  }
  return cache[tenant];
}

function plugin<JwksJwtOptions>(
  fastify: FastifyInstance,
  options: JwksJwtOptions & FastifyPluginOptions,
  next: Function
) {
  const provider = options.configProvider;
  const complete = options.complete;
  provider('default').then((config: any) => fastify.log.debug({ config }));
  fastify.decorateRequest('user', false);
  fastify.addHook(
    'onRequest',
    (request: FastifyRequest, _reply: FastifyReply, done: Function) => {
      const host = request.hostname;
      const authorization = request.headers.authorization;

      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.substring(authorization.indexOf(' ') + 1);
        const preDecode: any = decode(token, { complete: true });
        getClient(host, provider).then((client) => {
          client.getSigningKey(preDecode.header.kid, (err: any, key: any) => {
            if (err) {
              request.log.error(err);
            } else {
              try {
                const decoded = verify(token, key.publicKey) as any;
                if (typeof complete === 'function') {
                  complete(decoded.sub, decoded.aud).then((user: any) => {
                    (request as any).user = user;
                    done();
                  });
                } else {
                  (request as any).user = decoded;
                  done();
                }
              } catch (error) {
                // request.log.error(error);
                if (error.message) {
                  _reply
                    .status(403)
                    .send({ type: error.type, message: error.message });
                } else {
                  _reply.status(403).send(error);
                }
                done();
              }
            }
          });
        });
      } else {
        done();
      }
    }
  );
  next();
}

export default fp(plugin, {
  fastify: '3.x',
  name: 'fastify-jwksrsa-jwtverify',
});
