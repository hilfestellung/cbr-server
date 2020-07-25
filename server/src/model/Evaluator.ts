import { Schema, model } from 'mongoose';
import { evaluatorFactory } from '@hilfestellung/cbr-kernel';

const EvaluatorSchema = new Schema(
  {
    id: { type: String, immutable: true, required: true },
    tenant: { type: String, immutable: true, required: true },
    pattern: { type: String, required: true },
    type: { type: String },

    mode: { type: String },

    attributes: {
      type: [
        {
          id: { type: String },
          evaluator: { type: String },
          weight: { type: Number },
        },
      ],
      _id: false,
      default: void 0,
    },

    comparisonType: { type: String },
    elementEvaluator: { type: String },

    lookup: { type: Schema.Types.Mixed },

    min: { type: Schema.Types.Mixed },
    max: { type: Schema.Types.Mixed },
    cyclic: { type: Boolean, default: false },
    origin: { type: Schema.Types.Mixed },
    useOrigin: { type: Boolean, default: false },
    equalIfLess: { type: Number },
    equalIfMore: { type: Number },
    toleranceIfLess: { type: Number },
    toleranceIfMore: { type: Number },
    linearityIfLess: { type: Number },
    linearityIfMore: { type: Number },
    interpolationIfLess: { type: String },
    interpolationIfMore: { type: String },
  },
  {
    timestamps: true,
    toObject: {
      transform: (_doc, ret) => {
        return evaluatorFactory(ret);
      },
    },
  }
);
EvaluatorSchema.index({ id: 1, tenant: 1 }, { unique: true });
EvaluatorSchema.index({ id: 1 });
EvaluatorSchema.index({ pattern: 1 });
EvaluatorSchema.index({ tenant: 1 });

export const Evaluator = model('Evaluator', EvaluatorSchema, 'evaluators');
