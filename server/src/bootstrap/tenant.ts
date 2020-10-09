import { FastifyInstance } from 'fastify';
import { Configuration } from '../Configuration';
import { Tenant } from '../model/Tenant';
import tenant from '../plugins/tenant';

export default async function setup(
  fastify: FastifyInstance,
  _configuration: Configuration
) {
  fastify.register(tenant, {
    resolve: async (name: string) => {
      return (await Tenant.findOne({ name }))?.toObject();
    },
  });
}
