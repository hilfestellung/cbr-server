import { Schema, model } from 'mongoose';
import { classFactory } from '@hilfestellung/cbr-kernel';

export const BaseDefinition = {
  id: { type: Schema.Types.Mixed },
  properties: { type: Object },
};

const ModelClassSchema = new Schema(
  {
    id: { type: String, immutable: true, required: true },
    tenant: { type: String, immutable: true, required: true },
    type: { type: String, required: true },
    attributes: {
      type: [
        {
          id: String,
          type: { type: String },
          properties: Object,
        },
      ],
      _id: false,
      default: void 0,
    },
    elementType: { type: String },
    enumeration: { type: [{ ...BaseDefinition }], _id: false, default: void 0 },
    range: {
      min: { ...BaseDefinition },
      max: { ...BaseDefinition },
    },
    properties: { type: Object },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, ret) => {
        return classFactory(ret);
      },
    },
  }
);
ModelClassSchema.index({ id: 1, tenant: 1 }, { unique: true });
ModelClassSchema.index({ id: 1 });
ModelClassSchema.index({ tenant: 1 });
ModelClassSchema.index({ type: 1 });

export const ModelClass = model('Class', ModelClassSchema, 'classes');
