import { Schema, model } from 'mongoose';

declare module 'mongoose' {
  interface Model<T extends Document, QueryHelpers = {}> {
    nextValue: (name: string) => Promise<number>;
  }
}

const SequenceSchema = new Schema(
  {
    name: { type: String },
    counter: { type: Number },
  },
  {
    toObject: {
      transform: (_doc, ret) => {
        return ret.counter;
      },
    },
  }
);
SequenceSchema.index({ name: 1 });

export const Sequence = model('Sequence', SequenceSchema, 'sequences');
Sequence.nextValue = async function nextValue(name: string) {
  const doc = await Sequence.findOneAndUpdate(
    { name },
    { $inc: { counter: 1 } }
  );
  return doc?.toObject();
};
