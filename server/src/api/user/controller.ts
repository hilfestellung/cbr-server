import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../../model/User';

async function getMe(request: FastifyRequest, _reply: FastifyReply) {
  return request.jwt.user;
}

async function putSettings(request: FastifyRequest, reply: FastifyReply) {
  const { settings }: any = request.body;
  const user = await User.findById(request.jwt.user.id);
  if (user == null) {
    reply.status(404).send({ code: 'UserNotFound', message: 'User not found' });
    return;
  }
  user.set('settings', settings);
  return (await user.save()).toObject();
}

export const UserController = {
  getMe,
  putSettings,
};
