import { FastifyInstance } from 'fastify';
import { Configuration } from '../../Configuration';
import { hasTenant } from '../../plugins/tenant';
import Controller from './Controller';
import { SwaggerStore, SwaggerStoreInput } from './Store';

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  const controller = await Controller(fastify, configuration);
  return [
    {
      method: 'GET',
      url: '/store',
      preHandler: [hasTenant],
      handler: controller.list,
      schema: {
        tags: ['store'],
        query: {
          type: 'object',
          properties: {
            skip: {
              type: 'string',
              default: '0',
              description: 'Skip amount of entries',
            },
            limit: {
              type: 'string',
              default: '10',
              description: 'Maximum amount of result entries',
            },
          },
        },
        response: {
          200: {
            description: 'Array of store objects',
            type: 'array',
            items: SwaggerStore,
          },
        },
      },
    },
    {
      method: 'POST',
      url: '/store',
      preHandler: [hasTenant],
      handler: controller.create,
      schema: {
        tags: ['store'],
        body: SwaggerStoreInput,
        response: {
          201: SwaggerStore,
        },
      },
    },
    {
      method: 'GET',
      url: '/store/:name',
      preHandler: [hasTenant],
      handler: controller.read,
      schema: {
        tags: ['store'],
        params: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the store',
            },
          },
        },
        response: {
          200: SwaggerStore,
        },
      },
    },
    {
      method: 'PUT',
      url: '/store/:name',
      preHandler: [hasTenant],
      handler: controller.update,
      schema: {
        tags: ['store'],
        params: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the store',
            },
          },
        },
        body: SwaggerStoreInput,
        response: {
          200: SwaggerStore,
        },
      },
    },
    {
      method: 'DELETE',
      url: '/store/:name',
      preHandler: [hasTenant],
      handler: controller.remove,
      schema: {
        tags: ['store'],
        params: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the store',
            },
          },
        },
        response: {
          200: SwaggerStore,
        },
      },
    },
  ];
}
