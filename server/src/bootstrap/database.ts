import { FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { connect } from 'mongoose';
import { Configuration } from '../Configuration';

export default async function setup(
  fastify: FastifyInstance,
  configuration: Configuration
) {
  const logger: FastifyLoggerInstance = fastify.log;
  const { database } = configuration;
  const { name, user, authSource } = database;
  return connect(`mongodb://mongo/${name}`, {
    authSource,
    auth: {
      user,
      password: process.env.DATABASE_PASSWORD as string,
    },
  })
    .then(() => logger.info('MongoDB connected…'))
    .catch((err) => console.log(err));
}
