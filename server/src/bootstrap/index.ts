import { FastifyInstance } from 'fastify';
import { Configuration } from '../Configuration';

//import cors from './cors';
import database from './database';
import messageQueue from './message-queue';
import swagger from './swagger';
import tenant from './tenant';

export default async (
  fastify: FastifyInstance,
  configuration: Configuration
) => {
  await database(fastify, configuration);
  await messageQueue(fastify, configuration);
  await tenant(fastify, configuration);
  return Promise.all([
    //cors(fastify, configuration),
    swagger(fastify, configuration),
  ]);
};
