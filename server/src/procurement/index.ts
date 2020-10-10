import { FastifyInstance } from 'fastify';
import { Configuration } from '../Configuration';

import root from './root';
import store from './store';

export default function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  return Promise.all([
    root(fastify, configuration),
    store(fastify, configuration),
  ]).then((routes: any[]) => [].concat(...routes));
}
