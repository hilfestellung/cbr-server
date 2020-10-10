import { FastifyInstance, FastifyRequest } from 'fastify';
import { Configuration } from '../Configuration';
import { Tenant } from '../model/Tenant';
import tenant, { createDefaultTenantExtract } from '../plugins/tenant';

export default async function setup(
  fastify: FastifyInstance,
  _configuration: Configuration
) {
  const { log } = fastify;
  fastify.register(tenant, {
    extract: [
      async (request: FastifyRequest) => {
        let tenant;
        const headerValue = request.headers.origin as string;
        if (headerValue) {
          const tenantInfo = (
            await Tenant.findOne({ origins: headerValue })
          )?.toObject();
          if (tenantInfo) {
            tenant = tenantInfo.name;
          }
        }
        return tenant;
      },
      createDefaultTenantExtract({ header: 'origin' }),
    ],
    resolve: async (name: string) => {
      log.debug('Resolve tenant info of ' + name);
      return (await Tenant.findOne({ name }))?.toObject();
    },
  });
}
