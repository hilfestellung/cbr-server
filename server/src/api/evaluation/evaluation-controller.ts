import { FastifyRequest, FastifyReply } from 'fastify';
import {
  Retriever,
  RetrieverEvaluationOptions,
  Project,
} from '@hilfestellung/cbr-kernel';

async function evaluate(request: FastifyRequest, _reply: FastifyReply) {
  const { body, project, retriever }: any = request;
  const { options = {}, query } = body;
  console.log(query, body);
  const queryObject = project.queryClass.readObject(query);
  (options as RetrieverEvaluationOptions).queryEvaluatorId = (project as Project).defaultEvaluatorId;
  return (retriever as Retriever).evaluate(queryObject, options);
}

export const EvaluationController = {
  evaluate,
};
