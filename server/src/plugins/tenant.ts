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

export interface TenantExtractFunction {
  (request: FastifyRequest): Promise<string | undefined>;
}

export interface TenantOptions<T extends TenantInformation> {
  header?: string;
  extract?: TenantExtractFunction | TenantExtractFunction[];
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

export function extractSubdomain(url: string): string | undefined {
  if (url) {
    const { hostname } = parse(url);
    const parts = hostname?.split('.') || [];
    if (parts && parts.length > 2) {
      return parts[0];
    }
  }
  return;
}

export function createDefaultTenantExtract(
  options: TenantOptions<any>
): TenantExtractFunction {
  const { header } = { header: 'origin', ...options } as TenantOptions<any>;
  return async function tenantExtraction(request: FastifyRequest) {
    const { log } = request;
    if (header) {
      let tenant;
      const headerValue = request.headers[header] as string;
      if (headerValue) {
        tenant = extractSubdomain(headerValue);
        log.debug(`Request tenant for ${tenant}`);
      }
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
  let responsibles: TenantExtractFunction[];
  if (Array.isArray(extract)) {
    responsibles = extract;
  } else {
    responsibles = [extract];
  }
  fastify.decorateRequest('tenant', null);
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, _reply: FastifyReply) => {
      if (responsibles && resolve) {
        let tenantId;
        let i = 0;
        do {
          const singleExtract = extract[i++];
          tenantId = await singleExtract(request);
        } while (i < extract.length && !tenantId);
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
