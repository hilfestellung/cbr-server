import { TenantController } from './tenant';
import { jwtValid } from '../plugins/fastify-jwks-rsa-jwt-verify';
import { UserController } from './user/controller';
import { ModelClassController } from './model/modelclass-controller';
import { ProjectController } from './model/project-controller';
import { EvaluatorController } from './model/evaluator-controller';
import { AggregateObjectController } from './model/aggregate-controller';

export default [
  {
    method: 'GET',
    url: '/',
    handler: TenantController.getRoot,
  },
  // User
  {
    method: 'GET',
    url: '/me',
    preValidation: jwtValid,
    handler: UserController.getMe,
  },
  {
    method: 'PUT',
    url: '/me',
    preValidation: jwtValid,
    handler: UserController.putSettings,
  },
  // ModelClass
  {
    method: 'GET',
    url: '/class',
    handler: ModelClassController.getClasses,
  },
  {
    method: 'POST',
    url: '/class',
    preValidation: jwtValid,
    handler: ModelClassController.postClass,
  },
  {
    method: 'GET',
    url: '/class/:id',
    handler: ModelClassController.getClass,
  },
  {
    method: 'PUT',
    url: '/class/:id',
    preValidation: jwtValid,
    handler: ModelClassController.putClass,
  },
  {
    method: 'DELETE',
    url: '/class/:id',
    preValidation: jwtValid,
    handler: ModelClassController.removeClass,
  },
  // Evaluator
  {
    method: 'GET',
    url: '/evaluator',
    handler: EvaluatorController.getEvaluators,
  },
  {
    method: 'POST',
    url: '/evaluator',
    preValidation: jwtValid,
    handler: EvaluatorController.postEvaluator,
  },
  {
    method: 'GET',
    url: '/evaluator/:id',
    handler: EvaluatorController.getEvaluator,
  },
  {
    method: 'PUT',
    url: '/evaluator/:id',
    preValidation: jwtValid,
    handler: EvaluatorController.putEvaluator,
  },
  {
    method: 'DELETE',
    url: '/evaluator/:id',
    preValidation: jwtValid,
    handler: EvaluatorController.removeEvaluator,
  },
  // Project
  {
    method: 'GET',
    url: '/project',
    handler: ProjectController.getProjects,
  },
  {
    method: 'POST',
    url: '/project',
    preValidation: jwtValid,
    handler: ProjectController.postProject,
  },
  {
    method: 'GET',
    url: '/project/:id',
    handler: ProjectController.getProject,
  },
  {
    method: 'PUT',
    url: '/project/:id',
    preValidation: jwtValid,
    handler: ProjectController.putProject,
  },
  // AggregateObject
  {
    method: 'GET',
    url: '/aggregate',
    handler: AggregateObjectController.getObjects,
  },
  {
    method: 'POST',
    url: '/aggregate',
    preValidation: jwtValid,
    handler: AggregateObjectController.postObject,
  },
  {
    method: 'GET',
    url: '/aggregate/:id',
    handler: AggregateObjectController.getObject,
  },
  {
    method: 'PUT',
    url: '/aggregate/:id',
    preValidation: jwtValid,
    handler: AggregateObjectController.putObject,
  },
];
