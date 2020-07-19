import { FastifyRequest, FastifyReply } from 'fastify';
import { ModelClass } from '../../model/ModelClass';

async function getClasses(request: FastifyRequest, _reply: FastifyReply) {
  const { skip = '0', limit = '20' }: any = request.query;

  return (
    await ModelClass.find({ tenant: request.tenant.name })
      .sort({ id: 1, type: 1 })
      .skip(parseInt(skip, 10))
      .limit(Math.max(parseInt(limit, 10), 100))
  ).map((doc) => doc.toObject());
}

async function getClass(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const modelClass = await ModelClass.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (modelClass == null) {
    return reply.status(404).send({
      code: 'ClassNotFound',
      message: 'Class resource is not found by the given ID.',
    });
  }
  modelClass.set(request.body);
  return (await modelClass.save()).toObject();
}

async function postClass(request: FastifyRequest, _reply: FastifyReply) {
  request.log.debug({ data: request.body });
  return (
    await new ModelClass(request.body).set('tenant', request.tenant.name).save()
  ).toObject();
}

async function putClass(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const modelClass = await ModelClass.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (modelClass == null) {
    return reply.status(404).send({
      code: 'ClassNotFound',
      message: 'Class resource is not found by the given ID.',
    });
  }
  modelClass.set(request.body);
  return (await modelClass.save()).toObject();
}

export const ModelClassController = {
  getClasses,
  postClass,
  getClass,
  putClass,
};
