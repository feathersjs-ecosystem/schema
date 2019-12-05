import Joi from '@hapi/joi';

export const Type = Joi;

export const typeMap = new WeakMap<any, any>();

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
  name?: string;
}

export interface SchemaProperties {
  [key: string]: SchemaPropertyDefinition;
}

const validatorFromType = (type: Schema|SchemaPropertyType|(() => Joi.AnySchema)): Joi.AnySchema => {
  const value = typeMap.get(type) || type;

  if (Array.isArray(value) && value.length === 1) {
    const [ arrayValue ] = value;

    return Joi.array().items(validatorFromType(arrayValue));
  }

  const valueSchema = value instanceof Schema ? value : getSchema(value);

  if (valueSchema !== null) {
    return valueSchema.validator;
  }

  return value;
};

export function getValidator (properties: SchemaProperties) {
  const validators: Joi.SchemaMap = Object.keys(properties).reduce((current, key) => {
    const { type } = properties[key];

    return {
      ...current,
      [key]: validatorFromType(type)
    };
  }, {});

  return Joi.object(validators);
}

export class Schema {
  meta: SchemaMeta;
  properties: SchemaProperties;
  validator: Joi.ObjectSchema;

  constructor (schemaMeta: SchemaMeta, schemaProperties: SchemaProperties) {
    this.meta = {
      name: `schema-${++id}`
    };
    this.properties = {};

    this.addMetadata(schemaMeta);
    this.addProperties(schemaProperties);
  }

  async validate (value: any, options?: Joi.AsyncValidationOptions) {
    return this.validator.validateAsync(value, options);
  }

  addProperties (schemaProperties: SchemaProperties) {
    this.properties = Object.assign(this.properties, schemaProperties);
    this.validator = getValidator(this.properties);

    return this;
  }

  addMetadata (schemaMeta: SchemaMeta) {
    this.meta = Object.assign(this.meta, schemaMeta);

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
