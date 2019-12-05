import Joi = require('@hapi/joi');
import { getSchema } from '@feathersjs/schema';
import { Sequelize, DataTypes, ModelAttributeColumnOptions } from 'sequelize';

const typeMap: { [key: string]: any } = {
  string: DataTypes.STRING,
  number: DataTypes.NUMBER,
  boolean: DataTypes.BOOLEAN
};

const processFlag: { [key: string]: (value: any) => any } = {
  presence: (value: any) => ({ allowNull: value === 'required' })
};

export function convertProperty (description: Joi.Description) {
  const type = typeMap[description.type];
  const { flags = {} } = description;

  return Object.keys(flags).reduce((result, key) => {
    const value = (flags as any)[key];
    const processor = processFlag[key] || (() => ({}));
    const processed = processor(value);

    return {
      ...result,
      ...processed
    };
  }, { type } as ModelAttributeColumnOptions);
}

export function convert (target: any, client?: Sequelize) {
  const schema = getSchema(target);
  const describe = schema.validator.describe();
  const modelProperties = Object.keys(describe.keys).reduce((props, name) => {

    return {
      ...props,
      [name]: convertProperty(describe.keys[name])
    };
  }, {} as { [key: string]: any });

  return client.define(schema.meta.name, modelProperties);
}
