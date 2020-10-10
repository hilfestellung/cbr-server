import { FastifyInstance } from 'fastify';
import { Configuration } from '../../Configuration';
import RootController from './RootController';

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  const controller = await RootController(fastify, configuration);
  return [
    {
      method: 'GET',
      url: '/',
      handler: controller.info,
    },
  ];
}
