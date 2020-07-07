export const typeMap = new WeakMap<any, any>();
export const nameMap: { [key: string]: Schema } = {};

export let id = 0;

typeMap.set(String, Joi.string());
typeMap.set(Number, Joi.number());
typeMap.set(Boolean, Joi.boolean());

export type SchemaTypes = Schema|string|Joi.AnySchema|typeof String|typeof Number|typeof Boolean;
// tslint:disable-next-line:ban-types
export type SchemaPropertyType = SchemaTypes|SchemaTypes[]|Function;

export interface SchemaPropertyDefinition {
  type: SchemaPropertyType;
  [key: string]: any;
}

export interface SchemaMeta {
  name: string;
  [key: string]: any;
}

export interface SchemaProperties {
  [key: string]: SchemaPropertyDefinition;
}

export class Schema {
  meta: SchemaMeta;
  properties: SchemaProperties;

  constructor (schemaMeta: Partial<SchemaMeta>, schemaProperties: SchemaProperties) {
    this.properties = {};
    this.meta = {
      name: `schema-${++id}`
    };

    this.addMetadata(schemaMeta);
    this.addProperties(schemaProperties);
  }

  addProperties (schemaProperties: SchemaProperties) {
    this.properties = Object.assign(this.properties, schemaProperties);

    return this;
  }

  addMetadata (schemaMeta: Partial<SchemaMeta>) {
    const oldName = this.meta.name;

    this.meta = Object.assign(this.meta, schemaMeta);

    delete nameMap[oldName];
    nameMap[this.meta.name] = this;

    return this;
  }
}

export function setSchema (schema: Schema, target: any) {
  typeMap.set(target !== null ? target : schema, schema);

  return schema;
}

export function getSchema (target: any): Schema|null {
  if (target instanceof Schema) {
    return target;
  }

  if (typeof target === 'string') {
    return nameMap[target] || null;
  }

  if (!target) {
    return null;
  }

  let p = target;

  do {
    const schema = typeMap.get(p);

    if (schema !== undefined) {
      return schema;
    }

    p = p.prototype;
  } while (!!p);

  return null;
}
