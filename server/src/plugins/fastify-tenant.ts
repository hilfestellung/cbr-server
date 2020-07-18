import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export interface TenantOptions {
  tenantHeader?: string;
  tenantResolver?: (tenantId: string) => Promise<any>;
}

function plugin(
  fastify: FastifyInstance,
  options: TenantOptions & FastifyPluginOptions,
  next: Function
) {
  const {
    tenantHeader = 'origin',
    tenantResolver = (id: string) => Promise.resolve({ id }),
  } = options || {};
  fastify.decorateRequest('tenant', null);
  fastify.addHook('onRequest', async (request, reply) => {
    const { log } = request;
    const tenantHeaderValue = request.headers[tenantHeader] as string;
    if (!tenantHeaderValue) {
      reply
        .status(403)
        .send({ code: 'MissingTenant', message: 'Missing tenant' });
      return;
    }
    const tenantMatcher = /https?:\/\/((\w+)\.)*((.+)\.)?(\w+):?(\d*)/gi.exec(
      tenantHeaderValue
    );
    if (!tenantMatcher) {
      reply
        .status(403)
        .send({ code: 'InvalidTenant', message: 'Invalid tenant' });
      return;
    }
    const tenant = tenantMatcher[2] || tenantMatcher[5];
    (request as any).tenant = await tenantResolver(tenant);
    log.debug({ tenant: (request as any).tenant }, 'Tenant info');
  });
  next();
}

export default fp(plugin, {
  fastify: '3.x',
  name: 'fastify-tenant',
});
