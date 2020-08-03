import { FastifyRequest, FastifyReply } from 'fastify';

async function reloadProject(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.reloadProject();
    return request.project.toJSON();
  } catch (err) {
    request.log.error({ err }, 'Error reloading project');
    reply.status(500);
    return {
      code: 'FailedReloadingProject',
      message: 'Failed reloading project',
    };
  }
}

export const RetrieverController = {
  reloadProject,
};
