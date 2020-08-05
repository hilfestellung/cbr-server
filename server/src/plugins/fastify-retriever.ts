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
  ModelClass,
  AggregateEvaluator,
  SetClass,
  SetEvaluator,
} from '@hilfestellung/cbr-kernel';
import { Project as MongooseProject } from '../model/Project';
import { ModelClass as MongooseModelClass } from '../model/ModelClass';
import { Evaluator as MongooseEvaluator } from '../model/Evaluator';
import { AggregateObject as MongooseAggregateObject } from '../model/AggregateObject';

declare module 'fastify' {
  interface FastifyRequest {
    project: Project;
    retriever: LinearRetriever;
    reloadProject: Function;
  }
  // interface FastifyReply {
  //   myPluginProp: number
  // }
}

async function classesFrom(
  aggregateClass: AggregateClass,
  ignoreIds: string[] = []
): Promise<ModelClass<any>[]> {
  let classIds: string[] = aggregateClass.attributes
    .map((attribute) => attribute.typeId)
    .filter((id) => !ignoreIds.includes(id));

  let classes: ModelClass<any>[] = (
    await MongooseModelClass.find({ id: { $in: classIds } })
  ).map((doc) => doc.toObject());
  classes.push(aggregateClass);
  ignoreIds.push(aggregateClass.id);

  const sets = classes.filter(
    (modelClass) => !ignoreIds.includes(modelClass.id) && modelClass.isSet()
  );
  if (sets.length > 0) {
    classes = classes.concat(
      (
        await MongooseModelClass.find({
          id: { $in: sets.map((set: SetClass<any>) => set.elementTypeId) },
        })
      ).map((doc) => doc.toObject()) as ModelClass<any>[]
    );
    classIds = classIds.concat(
      sets.map((set: SetClass<any>) => set.elementTypeId) as string[]
    );
  }

  const aggregates = classes.filter(
    (modelClass) =>
      !ignoreIds.includes(modelClass.id) && modelClass.isAggregate()
  );
  (
    await Promise.all(
      aggregates.map(
        async (aggregate) =>
          await classesFrom(
            aggregate as AggregateClass,
            ignoreIds.concat(classIds)
          )
      )
    )
  ).forEach((subClasses) => {
    classes = classes.concat(...subClasses);
  });

  return classes;
}

async function evaluatorsFrom(
  aggregateEvaluator: AggregateEvaluator,
  ignoreIds: string[] = []
): Promise<SimilarityEvaluator<any>[]> {
  let evaluatorIds = aggregateEvaluator.attributes
    .map((attribute) => attribute.evaluator)
    .filter((id) => !ignoreIds.includes(id));
  let evaluators: SimilarityEvaluator<any>[] = (
    await MongooseEvaluator.find({ id: { $in: evaluatorIds } })
  ).map((doc) => doc.toObject());

  const sets = evaluators.filter((evaluator) => evaluator.pattern === 'set');
  if (sets.length > 0) {
    evaluators = evaluators.concat(
      (
        await MongooseEvaluator.find({
          id: {
            $in: sets.map((set: SetEvaluator) => set.elementEvaluatorId),
          },
        })
      ).map((doc) => doc.toObject()) as SimilarityEvaluator<any>[]
    );
    evaluatorIds = evaluatorIds.concat(
      sets.map((set: SetEvaluator) => set.elementEvaluatorId) as string[]
    );
  }

  const aggregates = evaluators.filter(
    (evaluator) => evaluator.pattern === 'aggregate'
  );
  evaluators.push(aggregateEvaluator);
  ignoreIds.push(aggregateEvaluator.id);
  (
    await Promise.all(
      aggregates.map(
        async (aggregate) =>
          await evaluatorsFrom(
            aggregate as AggregateEvaluator,
            ignoreIds.concat(evaluatorIds)
          )
      )
    )
  ).forEach((subEvaluators) => evaluators.concat(...subEvaluators));
  return evaluators;
}

export async function createRetriever(project: Project) {
  project.queryClass =
    project.queryClassId != null
      ? (
          await MongooseModelClass.findOne({ id: project.queryClassId })
        )?.toObject()
      : null;
  // Load model classes
  const classes =
    project.queryClass != null ? await classesFrom(project.queryClass) : null;
  // Load evaluators
  const queryClassEvaluator =
    project.defaultEvaluatorId != null
      ? (
          await MongooseEvaluator.findOne({ id: project.defaultEvaluatorId })
        )?.toObject()
      : null;
  const evaluators =
    queryClassEvaluator != null
      ? await evaluatorsFrom(queryClassEvaluator)
      : null;
  // Adjust classes -> load class instances from class ids
  adjustClasses(classes || []);
  project.classes = classes || [];
  project.evaluators = evaluators || [];
  queryClassEvaluator.evaluators = evaluators;
  // Provide the query class instance to the project
  // Assign the right min/max values to the number evaluators
  (evaluators || [])
    .filter((evaluator) => evaluator.pattern === 'number')
    .forEach((evaluator: NumberEvaluator) => {
      const modelClass = project.getModelClass(evaluator.typeId);
      if (modelClass && modelClass.predicate.isRange()) {
        const range = modelClass.predicate as PredicateRange<number | Date>;
        evaluator.setRange(range.getMinimum().id, range.getMaximum().id);
      }
    });
  (evaluators || [])
    .filter((evaluator) => evaluator.pattern === 'set')
    .forEach((evaluator: SetEvaluator) => {
      evaluator.evaluator = project.getEvaluator(evaluator.elementEvaluatorId);
    });
  // Create the linear retriever
  return new LinearRetriever(
    // Loading cases
    project.queryClass != null
      ? (await MongooseAggregateObject.find()).map(
          (doc) =>
            project.queryClass.readObject(
              doc.toObject().attributes
            ) as AggregateObject
        )
      : [],
    project
  );
}

function plugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  next: Function
) {
  const tenantRetrieverCache: any = {};
  function reloadProject(tenant?: string, id?: string) {
    const query: any = tenant && id ? { tenant, id } : undefined;
    return MongooseProject.find(query).then((docs) => {
      const projects: Project[] = [];
      return Promise.all(
        docs.map((doc) => {
          const project = doc.toObject() as Project;
          projects.push(project);
          return createRetriever(project);
        })
      ).then((retrievers: Retriever[]) => {
        retrievers.forEach((retriever, index) => {
          const tenant = docs[index].get('tenant');
          tenantRetrieverCache[tenant] = {
            project: projects[index],
            retriever,
          };
        });
      });
    });
  }
  reloadProject()
    .then(() => {
      fastify.log.debug('Projects successfully loaded');
    })
    .catch((err) => {
      fastify.log.error({ err }, 'Error while loading projects');
    });
  fastify.decorateRequest('project', null);
  fastify.decorateRequest('retriever', null);
  fastify.addHook('onRequest', async (request, _reply) => {
    const { tenant } = request;
    const { project, retriever }: any =
      tenantRetrieverCache[tenant.name] != null
        ? tenantRetrieverCache[tenant.name]
        : {};
    request.project = project;
    request.retriever = retriever;
    request.reloadProject = () => reloadProject(tenant.name, project.id);
  });
  next();
}

export default fp(plugin, {
  fastify: '3.x',
  name: 'fastify-retriever',
});
