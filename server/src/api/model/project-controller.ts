import { FastifyRequest, FastifyReply } from 'fastify';
import { Project } from '../../model/Project';

async function getProjects(request: FastifyRequest, _reply: FastifyReply) {
  const { skip = '0', limit = '20' }: any = request.query;

  return (
    await Project.find({ tenant: request.tenant.name })
      .sort({ id: 1 })
      .skip(parseInt(skip, 10))
      .limit(Math.max(parseInt(limit, 10), 100))
  ).map((doc) => doc.toObject());
}

async function getProject(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const project = await Project.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (project == null) {
    return reply.status(404).send({
      code: 'ProjectNotFound',
      message: 'Project resource is not found by the given ID.',
    });
  }
  project.set(request.body);
  return (await project.save()).toObject();
}

async function postProject(request: FastifyRequest, _reply: FastifyReply) {
  request.log.debug({ data: request.body });
  return (
    await new Project(request.body).set('tenant', request.tenant.name).save()
  ).toObject();
}

async function putProject(request: FastifyRequest, reply: FastifyReply) {
  const { id }: any = request.params;
  const project = await Project.findOne({
    id,
    tenant: request.tenant.name,
  });
  if (project == null) {
    return reply.status(404).send({
      code: 'ProjectNotFound',
      message: 'Project resource is not found by the given ID.',
    });
  }
  project.set(request.body);
  return (await project.save()).toObject();
}

export const ProjectController = {
  getProjects,
  getProject,
  postProject,
  putProject,
};
