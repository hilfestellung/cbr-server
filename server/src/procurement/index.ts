import { FastifyInstance } from 'fastify';
import { Configuration } from '../Configuration';

import root from './root';

export default function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  return Promise.all([root(fastify, configuration)]).then((routes: any[]) =>
    [].concat(...routes)
  );
}
