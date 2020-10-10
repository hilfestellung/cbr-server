import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Configuration } from '../../Configuration';
import { Store, StoreDefinition } from './Store';

async function list(request: FastifyRequest, _reply: FastifyReply) {
  const { tenant, query } = request;
  const { skip = '0', limit = '10' } = query as any;
  return (
    await Store.find({ tenant: tenant.name })
      .sort({ name: 1 })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10))
  ).map((doc) => doc.toObject());
}

async function create(request: FastifyRequest, reply: FastifyReply) {
  const { tenant, body } = request;
  const store = new Store({
    ...(body as any),
    canEvaluate: false,
    tenant: tenant.name,
  });
  reply.status(201);
  return (await store.save()).toObject();
}

async function read(request: FastifyRequest, reply: FastifyReply) {
  const { tenant, params } = request;
  const { name } = params as any;
  const store = await Store.findOne({ tenant: tenant.name, name });
  if (store == null) {
    reply.status(404);
    throw new Error('Store not found');
  }
  return store.toObject();
}

async function update(request: FastifyRequest, reply: FastifyReply) {
  const { tenant, body, params } = request;
  const { name } = params as any;
  const store = await Store.findOne({ tenant: tenant.name, name });
  if (store == null) {
    reply.status(404);
    throw new Error('Store not found');
  }
  delete (body as any).tenant;
  delete (body as any).canEvaluate;
  store.set(body);
  return (await store.save()).toObject();
}

async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { tenant, params } = request;
  const { name } = params as any;
  const store = await Store.findOne({ tenant: tenant.name, name });
  if (store == null) {
    reply.status(404);
    throw new Error('Store not found');
  }
  return (await store.deleteOne()).toObject();
}

export interface StoreController {
  list(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<StoreDefinition[]>;
  create(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<StoreDefinition>;
  read(request: FastifyRequest, reply: FastifyReply): Promise<StoreDefinition>;
  update(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<StoreDefinition>;
  remove(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<StoreDefinition>;
}

export default async function setup(
  _fastify: FastifyInstance,
  _configuration: Configuration
): Promise<StoreController> {
  return {
    list,
    create,
    read,
    update,
    remove,
  } as StoreController;
}
