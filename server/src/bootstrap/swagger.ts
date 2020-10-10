import { FastifyInstance } from 'fastify';
import swagger from 'fastify-swagger';
import { Configuration } from '../Configuration';
import { SwaggerProperty as Property } from '../model/PropertyBased';
import {
  SwaggerStoreInput as StoreInput,
  SwaggerStore as Store,
} from '../procurement/store/Store';

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  return fastify.register(swagger, {
    routePrefix: '/docs',
    swagger: {
      info: {
        title: 'Case Based Reasoning',
        description:
          'Tenant based API accessing your case based reasoning processes.',
        version: configuration.version,
      },
      host: 'api.case-based-reasoning.org',
      schemes: ['https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [{ name: 'store', description: 'Store related end-points' }],
      definitions: {
        Property,
        StoreInput,
        Store,
      },
      //   securityDefinitions: {
      //     apiKey: {
      //       type: 'apiKey',
      //       name: 'apiKey',
      //       in: 'header',
      //     },
      //   },
    },
    exposeRoute: true,
  });
}
