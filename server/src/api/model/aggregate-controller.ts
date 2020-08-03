import { FastifyRequest, FastifyReply } from 'fastify';
import { AggregateObject } from '../../model/AggregateObject';
import { classFactory } from '@hilfestellung/cbr-kernel';
import { Sequence } from '../../model/Sequence';

async function getObjects(request: FastifyRequest, _reply: FastifyReply) {
  const { query, tenant, project }: any = request;
  const { skip = '0', limit = '20' }: any = query;
  return (
    await AggregateObject.find({
      tenant: tenant.name,
      type: project.queryClassId,
    })
      .sort({ id: 1 })
      .skip(parseInt(skip, 10))
      .limit(Math.max(parseInt(limit, 10), 100))
  ).map((doc) => doc.toObject());
}

async function getObject(request: FastifyRequest, reply: FastifyReply) {
  const { params, tenant, project }: any = request;
  const { id } = params;
  const aggregateObject = await AggregateObject.findOne({
    id,
    tenant: tenant.name,
    type: project.queryClassId,
  });
  if (aggregateObject == null) {
    return reply.status(404).send({
      code: 'AggregateObjectNotFound',
      message: 'AggregateObject resource is not found by the given ID.',
    });
  }
  return aggregateObject.toObject();
}

async function postObject(request: FastifyRequest, _reply: FastifyReply) {
  const { tenant, project, body }: any = request;
  const newObject = (
    await new AggregateObject(project.queryClass.readObject(body)?.toJSON())
      .set('tenant', tenant.name)
      .set('revision', await Sequence.nextValue('revision'))
      .save()
  ).toObject();
  if (request.retriever) {
    request.retriever.addCase(newObject);
  }
  return newObject;
}

async function putObject(request: FastifyRequest, reply: FastifyReply) {
  const { params, tenant, project }: any = request;
  const { id }: any = params;
  const aggregateObject = await AggregateObject.findOne({
    id,
    tenant: tenant.name,
    type: project.queryClassId,
  });
  if (aggregateObject == null) {
    return reply.status(404).send({
      code: 'AggregateObjectNotFound',
      message: 'AggregateObject resource is not found by the given ID.',
    });
  }
  aggregateObject.set(classFactory(request.body)?.toJSON());
  return (await aggregateObject.save()).toObject();
}

async function removeObject(request: FastifyRequest, reply: FastifyReply) {
  const { params, tenant, project }: any = request;
  const { id }: any = params;
  const aggregateObject = await AggregateObject.findOne({
    id,
    tenant: tenant.name,
    type: project.queryClassId,
  });
  if (aggregateObject == null) {
    return reply.status(404).send({
      code: 'AggregateObjectNotFound',
      message: 'AggregateObject resource is not found by the given ID.',
    });
  }
  return (await aggregateObject.deleteOne()).toObject();
}

export const AggregateObjectController = {
  getObjects,
  postObject,
  getObject,
  putObject,
  removeObject,
};
