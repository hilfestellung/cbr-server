import fp from 'fastify-plugin';
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { verify, decode } from 'jsonwebtoken';

import jwksClient from 'jwks-rsa';
import { TenantInformation } from './fastify-tenant';

export enum JwksJwtStatus {
  None,
  Invalid,
  Valid,
}

declare module 'fastify' {
  interface FastifyRequest {
    jwt: {
      user: any;
      status: JwksJwtStatus;
      mayProceed: () => boolean;
    };
  }
  // interface FastifyReply {
  //   myPluginProp: number
  // }
}

export interface ConfigProviderFn<T extends TenantInformation> {
  (tenant: T): Promise<jwksClient.ClientOptions>;
}

export interface JwksJwtOptions {
  configProvider: ConfigProviderFn<any>;
  complete?: (
    subject: string,
    audience: string,
    request: FastifyRequest
  ) => Promise<object>;
}

export function jwtValid(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: Function
) {
  if (!request.jwt.mayProceed()) {
    return done(new Error());
  }
  done();
}

const cache: any = {};

async function getClient(
  tenant: TenantInformation,
  configProvider: ConfigProviderFn<any>
): Promise<jwksClient.JwksClient> {
  if (!cache[tenant.name]) {
    cache[tenant.name] = jwksClient(await configProvider(tenant));
  }
  return cache[tenant.name];
}

function createMayProceed(status: JwksJwtStatus, reply: FastifyReply) {
  return () => {
    if (status === JwksJwtStatus.None) {
      reply.status(403).send({
        code: 'MissingJsonWebToken',
        message: 'The request is missing a JSON Web Token.',
      });
      return false;
    }
    if (status === JwksJwtStatus.Invalid) {
      reply.status(403).send({
        code: 'InvalidJsonWebToken',
        message: 'The request has an invalid JSON Web Token.',
      });
      return false;
    }
    return true;
  };
}

function plugin<JwksJwtOptions>(
  fastify: FastifyInstance,
  options: JwksJwtOptions & FastifyPluginOptions,
  next: Function
) {
  const provider = options.configProvider;
  const complete = options.complete;
  fastify.decorateRequest('user', false);
  fastify.addHook(
    'onRequest',
    (request: FastifyRequest, reply: FastifyReply, done: Function) => {
      const authorization = request.headers.authorization;

      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.substring(authorization.indexOf(' ') + 1);
        const preDecode: any = decode(token, { complete: true });
        getClient(request.tenant, provider).then((client) => {
          if (!client) {
            request.jwt = {
              user: undefined,
              status: JwksJwtStatus.None,
              mayProceed: createMayProceed(JwksJwtStatus.None, reply),
            };
            done();
            return;
          }
          client.getSigningKey(preDecode.header.kid, (err: any, key: any) => {
            if (err) {
              request.log.error(err);
            } else {
              try {
                const decoded = verify(token, key.publicKey) as any;
                if (typeof complete === 'function') {
                  complete(decoded.sub, decoded.aud, request)
                    .then((user: any) => {
                      request.jwt = {
                        user,
                        status: JwksJwtStatus.Valid,
                        mayProceed: createMayProceed(
                          JwksJwtStatus.Valid,
                          reply
                        ),
                      };
                      done();
                    })
                    .catch((err: any) => {
                      request.log.error(err);
                      request.jwt = {
                        user: undefined,
                        status: JwksJwtStatus.Invalid,
                        mayProceed: createMayProceed(
                          JwksJwtStatus.Invalid,
                          reply
                        ),
                      };
                      done({
                        statusCode: 403,
                        code: 'ErrorCompletingUser',
                        message: 'Error while completing the user information.',
                      });
                    });
                } else {
                  request.jwt = {
                    user: decoded,
                    status: JwksJwtStatus.Valid,
                    mayProceed: createMayProceed(JwksJwtStatus.Valid, reply),
                  };
                  done();
                }
              } catch (error) {
                request.log.error(error);
                request.jwt = {
                  user: undefined,
                  status: JwksJwtStatus.Invalid,
                  mayProceed: createMayProceed(JwksJwtStatus.Invalid, reply),
                };
                done();
              }
            }
          });
        });
      } else {
        request.jwt = {
          user: undefined,
          status: JwksJwtStatus.None,
          mayProceed: createMayProceed(JwksJwtStatus.None, reply),
        };
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
