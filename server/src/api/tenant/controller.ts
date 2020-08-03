import { FastifyRequest, FastifyReply } from 'fastify';
import { boomify } from '@hapi/boom';
import { Tenant } from '../../model/Tenant';

async function getRoot(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { tenant, log } = (request as unknown) as any;
    log.debug({ tenant }, 'From request');
    const result = (await Tenant.findOne({ name: tenant.name }))?.toObject();
    if (!result) {
      reply.status(404).send({
        code: 'TenantNotFound',
        message: "Could't find tenant for domain",
      });
      return;
    }
    delete result.jwks;
    delete result.cors;
    result.project = request.project;
    return result;
  } catch (err) {
    throw boomify(err);
  }
}

export const TenantController = {
  getRoot,
};
