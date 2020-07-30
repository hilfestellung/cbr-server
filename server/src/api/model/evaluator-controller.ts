import { FastifyRequest, FastifyReply } from 'fastify';
import { Evaluator } from '../../model/Evaluator';
import { evaluatorFactory } from '@hilfestellung/cbr-kernel';

async function getEvaluators(request: FastifyRequest, _reply: FastifyReply) {
  const { skip = '0', limit = '20' }: any = request.query;

  return (
    await Evaluator.find({ tenant: request.tenant.name })
      .sort({ id: 1, type: 1 })
      .skip(parseInt(skip, 10))
      .limit(Math.max(parseInt(limit, 10), 100))
  ).map((doc) => doc.toObject());
}

async function getEvaluator(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const evaluator = await Evaluator.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (evaluator == null) {
    return reply.status(404).send({
      code: 'EvaluatorNotFound',
      message: 'Evaluator resource is not found by the given ID.',
    });
  }
  return evaluator.toObject();
}

async function postEvaluator(request: FastifyRequest, _reply: FastifyReply) {
  return (
    await new Evaluator(evaluatorFactory(request.body)?.toJSON())
      .set('tenant', request.tenant.name)
      .save()
  ).toObject();
}

async function putEvaluator(request: FastifyRequest, reply: FastifyReply) {
  const { log, params } = request;
  const { id }: any = params;
  const evaluator = await Evaluator.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (evaluator == null) {
    return reply.status(404).send({
      code: 'EvaluatorNotFound',
      message: 'Evaluator resource is not found by the given ID.',
    });
  }
  const newEvaluator = evaluatorFactory(request.body)?.toJSON();
  log.debug({ newEvaluator, input: request.body });
  evaluator.set(newEvaluator);
  return (await evaluator.save()).toObject();
}

async function removeEvaluator(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const evaluator = await Evaluator.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (evaluator == null) {
    return reply.status(404).send({
      code: 'EvaluatorNotFound',
      message: 'Evaluator resource is not found by the given ID.',
    });
  }
  return (await evaluator.deleteOne()).toObject();
}

export const EvaluatorController = {
  getEvaluators,
  getEvaluator,
  postEvaluator,
  putEvaluator,
  removeEvaluator,
};
