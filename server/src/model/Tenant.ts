import { Schema, model } from 'mongoose';

const TenantSchema = new Schema(
  {
    name: { type: String, index: true, unique: true },
    jwks: { type: Object },
    cors: { type: Object },
    origins: { type: [String], index: true },
    contact: { type: String },
    settings: { type: Object },
  },
  {
    toObject: {
      transform: (_doc, ret) => {
        delete ret._id;
        return { ...ret };
      },
    },
  }
);

export const Tenant = model('Tenant', TenantSchema, 'tenants');
