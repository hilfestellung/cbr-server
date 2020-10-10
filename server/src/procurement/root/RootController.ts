import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Configuration } from '../../Configuration';

function createInfo(_fastify: FastifyInstance, configuration: Configuration) {
  const { version } = configuration;
  return async function info(request: FastifyRequest, _reply: FastifyReply) {
    const { tenant } = request;
    if (tenant) {
      return { version, tenant };
    }
    return { version };
  };
}

export interface RootController {
  info(request: FastifyRequest, reply: FastifyReply): Promise<any>;
}

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
): Promise<RootController> {
  return {
    info: createInfo(fastify, configuration),
  } as RootController;
}
