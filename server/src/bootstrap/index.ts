import { FastifyInstance } from 'fastify';
import { Configuration } from '../Configuration';

import database from './database';
import messageQueue from './message-queue';
import tenant from './tenant';

export default async (
  fastify: FastifyInstance,
  configuration: Configuration
) => {
  await database(fastify, configuration);
  await messageQueue(fastify, configuration);
  return Promise.all([tenant(fastify, configuration)]);
};
