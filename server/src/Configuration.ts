/*

    "database": {
        "name": "a90mk5",
        "authSource": "admin",
        "user": "root"
      },
      "mailer": {
        "host": "sslout.df.eu",
        "port": 465
      },
      "logger": {
        "level": "debug"
      }

 */

import { FastifyLoggerOptions } from 'fastify';

export interface DatabaseConfiguration {
  name: string;
  authSource: string;
  user: string;
}

export interface Configuration {
  version: string;
  database: DatabaseConfiguration;
  logger: FastifyLoggerOptions;
}
