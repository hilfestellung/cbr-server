import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { Logger } from 'pino';
import { Configuration } from '../Configuration';
import { MemoryMessageQueue, MessageQueue } from '../utils/MessageQueue';

declare module 'fastify' {
  interface FastifyInstance {
    messages: MessageQueue;
  }
  interface FastifyRequest {
    messages: MessageQueue;
  }
}

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  const logger: FastifyLoggerInstance = fastify.log;
  const {} = configuration;
  logger.debug('Initializing authentication');
  const messageQueue = new MemoryMessageQueue(fastify.log as Logger);
  return fastify
    .decorate('messages', messageQueue)
    .decorateRequest('messages', messageQueue);
}
