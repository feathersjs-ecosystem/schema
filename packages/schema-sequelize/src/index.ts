import Joi = require('@hapi/joi');
import { getSchema, SchemaPropertyDefinition } from '@feathersjs/schema';
import { Sequelize, DataTypes, ModelAttributeColumnOptions, ModelCtor, Model } from 'sequelize';

const typeMap: { [key: string]: any } = {
  string: DataTypes.STRING,
  number: DataTypes.NUMBER,
  boolean: DataTypes.BOOLEAN
};

const processFlag: { [key: string]: (value: any) => any } = {
  presence: (value: any) => ({ allowNull: value !== 'required' })
};

export function convertProperty (description: Joi.Description, propDef: SchemaPropertyDefinition) {
  const type = typeMap[description.type];

  if (!type) {
    return null;
  }

  const { flags = {}, rules = [] } = description;
  const { sequelize = {} } = propDef;

  const withFlags = Object.keys(flags).reduce((result, key) => {
    const value = (flags as any)[key];
    const processor = processFlag[key] || (() => ({}));
    const processed = processor(value);

    return {
      ...result,
      ...processed
    };
  }, { type } as ModelAttributeColumnOptions);

  const converted = rules.reduce((result: any, rule: any) => {
    if (rule.name === 'integer') {
      return {
        ...result,
        type: DataTypes.INTEGER
      };
    }
    return result;
  }, withFlags);

  return {
    ...converted,
    ...sequelize
  };
}

export function convert<T = any> (target: any, client?: Sequelize) {
  const schema = getSchema(target);
  const describe = schema.validator.describe();
  const modelProperties = Object.keys(describe.keys).reduce((props, name) => {
    const converted = convertProperty(describe.keys[name], schema.properties[name]);

    if (converted === null) {
      return props;
    }

    return {
      ...props,
      [name]: converted
    };
  }, {} as { [key: string]: any });

  return client.define(schema.meta.name, modelProperties) as ModelCtor<Model<T>>;
}

export function associate (client: Sequelize) {
  const names = Object.keys(client.models);

  names.forEach(name => {
    const schema = getSchema(name);
    const model = client.models[name];

    if (schema && schema.meta.sequelize) {
      schema.meta.sequelize(model, client.models);
    }
  });

  return client;
}
