import { Schema, model } from 'mongoose';

const AggregateObjectSchema = new Schema(
  {
    id: { type: String, immutable: true, required: true },
    tenant: { type: String, immutable: true, required: true },
    type: { type: String },
    properties: { type: Object },
    attributes: {
      type: [{ id: { type: String }, value: Schema.Types.Mixed }],
      default: void 0,
    },
  },
  {
    timestamps: true,
  }
);
AggregateObjectSchema.index({ id: 1, tenant: 1 }, { unique: true });
AggregateObjectSchema.index({ id: 1, tenant: 1, type: 1 }, { unique: true });
AggregateObjectSchema.index({ id: 1 });
AggregateObjectSchema.index({ tenant: 1 });
AggregateObjectSchema.index({ type: 1 });

export const AggregateObject = model(
  'AggregateObject',
  AggregateObjectSchema,
  'aggregates'
);
