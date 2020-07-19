import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    subject: { type: String, index: true, unique: true, required: true },
    tenant: { type: String, index: true, required: true },
    permissions: [{ type: String }],
    settings: { type: Object },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, ret) => {
        const id = ret._id;
        delete ret._id;
        return { id, ...ret };
      },
    },
  }
);

export const User = model('User', UserSchema, 'users');
