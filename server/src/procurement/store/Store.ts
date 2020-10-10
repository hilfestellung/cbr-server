import { Schema, model } from 'mongoose';
import { PropertyBased, SwaggerProperty } from '../../model/PropertyBased';

const StoreSchema = new Schema(
  {
    tenant: { type: String },
    name: { type: String },
    canEvaluate: { type: Boolean },
    properties: {
      type: [
        {
          name: { type: String },
          lang: { type: String },
          value: { type: String },
        },
      ],
      _id: false,
    },
  },
  {
    autoIndex: false,
    timestamps: true,
  }
).index({ tenant: 1, name: 1 }, { unique: true });

export interface StoreDefinition extends PropertyBased {
  tenant: string;
  name: string;
  canEvaluate: boolean;
}
export const SwaggerStoreInput: any = {
  description: 'Store input object',
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    properties: {
      type: 'array',
      items: SwaggerProperty,
    },
  },
};

export const SwaggerStore: any = {
  ...SwaggerStoreInput,
  description: 'Full store object',
  properties: {
    ...SwaggerStoreInput.properties,
    tenant: { type: 'string' },
    canEvaluate: {
      type: 'boolean',
      description: 'Maintained by the server',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

export const Store = model('Store', StoreSchema, 'stores');
Store.ensureIndexes((err: any) => {
  console.error(err);
});
