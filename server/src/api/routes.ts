import { TenantController } from './tenant';
import { jwtValid } from '../plugins/fastify-jwks-rsa-jwt-verify';
import { UserController } from './user/controller';
import { ModelClassController } from './model/modelclass-controller';

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
];
