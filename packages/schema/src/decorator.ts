import 'reflect-metadata';
import { getSchema, schema, SchemaPropertyDefinition } from './index';
import { SchemaMeta } from './core';

export function propertyDecorator (definition: Partial<SchemaPropertyDefinition> = {}) {
  return (target: any, propertyName: string) => {
    const type = Reflect.getMetadata('design:type', target, propertyName);
    const targetSchema = getSchema(target) || schema(target, {}, {});

    targetSchema.addProperties({
      [propertyName]: {
        type,
        ...definition
      }
    });
  };
}

export function schemaDecorator (definition: Partial<SchemaMeta>) {
  return (target: any) => {
    const targetSchema = getSchema(target) || schema(target, {}, {});

    targetSchema.addMetadata(definition);
  };
}
