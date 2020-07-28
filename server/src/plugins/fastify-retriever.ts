import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  Project,
  LinearRetriever,
  adjustClasses,
  SimilarityEvaluator,
  NumberEvaluator,
  PredicateRange,
  AggregateClass,
  AggregateObject,
  Retriever,
} from '@hilfestellung/cbr-kernel';
import { Project as MongooseProject } from '../model/Project';
import { ModelClass } from '../model/ModelClass';
import { Evaluator as MongooseEvaluator } from '../model/Evaluator';
import { AggregateObject as MongooseAggregateObject } from '../model/AggregateObject';

export interface TenantInformation {
  name: string;
  settings: any;
}

declare module 'fastify' {
  interface FastifyRequest {
    project: Project;
    retriever: LinearRetriever;
  }
  // interface FastifyReply {
  //   myPluginProp: number
  // }
}

export async function createRetriever(project: Project) {
  // Load model classes
  const classes = Array.isArray(project.classIds)
    ? (await ModelClass.find({ type: { $in: project.classIds } })).map((doc) =>
        doc.toObject()
      )
    : [];
  // Load evaluators
  const evaluators = Array.isArray(project.evaluatorIds)
    ? (
        await MongooseEvaluator.find({
          id: { $in: project.evaluatorIds },
        })
      ).map((doc) => doc.toObject() as SimilarityEvaluator<any>)
    : [];
  // Adjust classes -> load class instances from class ids
  adjustClasses(classes);
  project.classes = classes;
  // Provide the query class instance to the project
  project.queryClass = project.getModelClass(
    project.queryClassId as string
  ) as AggregateClass;
  // Assign the right min/max values to the number evaluators
  evaluators
    .filter((evaluator) => evaluator.pattern === 'number')
    .forEach((evaluator: NumberEvaluator) => {
      const modelClass = project.getModelClass(evaluator.typeId);
      if (modelClass && modelClass.predicate.isRange()) {
        const range = modelClass.predicate as PredicateRange<number | Date>;
        evaluator.setRange(range.getMinimum().id, range.getMaximum().id);
      }
    });
  project.evaluators = evaluators;
  // Create the linear retriever
  return new LinearRetriever(
    // Loading cases
    project.queryClass != null
      ? (
          await MongooseAggregateObject.find({ type: project.queryClassId })
        ).map(
          (doc) =>
            project.queryClass.readObject(doc.toObject()) as AggregateObject
        )
      : [],
    project
  );
}

export interface TenantOptions<T extends TenantInformation> {
  tenantHeader?: string;
  tenantResolver?: (tenantId: string) => Promise<T>;
}

function plugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  next: Function
) {
  const tenantRetrieverCache: any = {};
  MongooseProject.find().then((docs) => {
    const projects: Project[] = [];
    Promise.all(
      docs.map((doc) => {
        const project = doc.toObject() as Project;
        projects.push(project);
        return createRetriever(project);
      })
    ).then((retrievers: Retriever[]) => {
      retrievers.forEach((retriever, index) => {
        const tenant = docs[index].get('tenant');
        tenantRetrieverCache[tenant] = { project: projects[index], retriever };
      });
    });
  });
  fastify.decorateRequest('project', null);
  fastify.decorateRequest('retriever', null);
  fastify.addHook('onRequest', async (request, _reply) => {
    const { tenant } = request;
    const { project, retriever } = tenantRetrieverCache[tenant.name];
    request.project = project;
    request.retriever = retriever;
  });
  next();
}

export default fp(plugin, {
  fastify: '3.x',
  name: 'fastify-retriever',
});
