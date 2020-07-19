import { TenantController } from './tenant';
import { jwtValid } from '../plugins/fastify-jwks-rsa-jwt-verify';
import { UserController } from './user/controller';

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
];
