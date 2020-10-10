export interface Property {
  name: string;
  lang: string;
  value: string;
}

export interface PropertyBased {
  properties: Property[];
}

export const SwaggerProperty: any = {
  description: 'Localized property name value pair.',
  type: 'object',
  required: ['name', 'lang'],
  properties: {
    name: { type: 'string' },
    lang: { type: 'string' },
    value: { type: 'string' },
  },
};
