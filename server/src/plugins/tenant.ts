import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';

import { parse } from 'url';

declare module 'fastify' {
  interface FastifyRequest {
    tenant: TenantInformation;
  }
}

export interface TenantInformation {
  name: string;
  settings: any;
}

export interface TenantOptions<T extends TenantInformation> {
  header?: string;
  extract?: (request: FastifyRequest) => Promise<string>;
  resolve?: (tenantId: string) => Promise<T>;
}

export function hasTenant(
  request: FastifyRequest,
  reply: FastifyReply,
  done: Function
) {
  if (!request.tenant) {
    reply.status(403);
    return done(new Error('Tenant is missing.'));
  }
  done();
}

function createDefaultTenantExtract(options: TenantOptions<any>) {
  const { header } = { header: 'origin', ...options } as TenantOptions<any>;
  return async function tenantResolver(
    request: FastifyRequest,
    _reply: FastifyReply
  ) {
    const { log } = request;
    if (header) {
      const { hostname } = parse(request.headers[header] as string);
      const [tenant] = hostname?.split('.') || [];
      log.debug(`Request tenant for ${tenant}`);
      return tenant;
    }
    return;
  };
}

function plugin(
  fastify: FastifyInstance,
  options: TenantOptions<any> & FastifyPluginOptions,
  next: Function
) {
  const { extract, resolve } = {
    extract: createDefaultTenantExtract(options),
    resolve: (name: string) => ({ name }),
    ...options,
  };
  fastify.decorateRequest('tenant', null);
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (extract && resolve) {
        const tenantId = await extract(request, reply);
        if (tenantId) {
          request.tenant = await resolve(tenantId);
        }
      }
    }
  );
  next();
}

export default fp(plugin, {
  fastify: '3.x',
  name: 'fastify-tenant',
});
