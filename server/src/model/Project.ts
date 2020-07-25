import { Schema, model } from 'mongoose';
import { projectFactory } from '@hilfestellung/cbr-kernel';

const ProjectSchema = new Schema(
  {
    id: { type: String, immutable: true, required: true },
    tenant: { type: String, immutable: true, required: true },
    languages: { type: [String], default: void 0 },
    queryClass: { type: String },
    properties: { type: Object },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, ret) => {
        return projectFactory(ret);
      },
    },
  }
);
ProjectSchema.index({ id: 1, tenant: 1 }, { unique: true });
ProjectSchema.index({ id: 1 });
ProjectSchema.index({ tenant: 1 });

export const Project = model('Project', ProjectSchema, 'projects');
