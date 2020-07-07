import { SchemaMeta, SchemaProperties, Schema, setSchema } from './core';
import { schemaDecorator, propertyDecorator } from './decorator';

export * from './core';
export * from './decorator';
export * from './resolve';

export const property = propertyDecorator;

export function schema (schemaMeta: Partial<SchemaMeta>, schemaProperties: SchemaProperties): Schema;
export function schema (target: any, schemaMeta: Partial<SchemaMeta>, schemaProperties: SchemaProperties): Schema;
export function schema (schemaMeta: Partial<SchemaMeta>): (target: any) => void;
export function schema (...args: any[]) {
  if (args.length === 1) {
    return schemaDecorator(args[0]);
  }

  const target = args.length === 3 ? args.shift() : null;
  const [ schemaMeta, schemaProperties ] = args;
  const schema = new Schema(schemaMeta, schemaProperties);

  setSchema(schema, target);

  return schema;
}
