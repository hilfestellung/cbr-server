import { Schema, model } from 'mongoose';

const TenantSchema = new Schema(
  {
    name: { type: String, index: true, unique: true },
    jwks: { type: Object },
    cors: { type: Object },
    contact: { type: String },
    settings: { type: Object },
  },
  {
    toObject: {
      transform: (_doc, ret) => {
        const id = ret._id;
        delete ret._id;
        return { id, ...ret };
      },
    },
  }
);

export const Tenant = model('Tenant', TenantSchema, 'tenants');
