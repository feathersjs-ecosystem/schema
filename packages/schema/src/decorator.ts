import 'reflect-metadata';
import Joi, { AnySchema } from '@hapi/joi';
import { getSchema, schema, SchemaPropertyDefinition, validatorFromType } from './index';
import { SchemaMeta } from './core';

export type TypeInitializer<T> = (type: T) => T;

export function propertyDecorator<T extends AnySchema = Joi.AnySchema> (
  definition: Partial<SchemaPropertyDefinition>|TypeInitializer<T> = {},
  propDef: Partial<SchemaPropertyDefinition> = {}
) {
  return (target: any, propertyName: string) => {
    const type = Reflect.getMetadata('design:type', target, propertyName);
    const targetSchema = getSchema(target) || schema(target, {}, {});

    if (typeof definition === 'function') {
      targetSchema.addProperties({
        [propertyName]: {
          type: definition(validatorFromType(type) as T),
          ...propDef
        }
      });
    } else {
      targetSchema.addProperties({
        [propertyName]: {
          type,
          ...definition
        }
      });
    }
  };
}

export function schemaDecorator (definition: Partial<SchemaMeta>) {
  return (target: any) => {
    const targetSchema = getSchema(target) || schema(target, {}, {});

    targetSchema.addMetadata(definition);
  };
}
