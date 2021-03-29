import { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import { FeathersError } from '@feathersjs/errors';

export class ValidationError extends FeathersError {
  constructor (message: string, data: any) {
    super(message, 'validation-error', 422, 'ValidationError', data);
  }
}

export interface SchemaMetadata<V> {
  original?: V;
}

export type SchemaPropertyFunction<T, O = any, V = T, C = any> =
  (value: V, parent: O, context: C, metadata: SchemaMetadata<V>) => Promise<T>;

export interface Schema<T, V = any, C = any> {
  resolve (value: V, context: C, metadata: SchemaMetadata<V>): Promise<T>;
  validate (value: V, context: C, metadata: SchemaMetadata<V>): Promise<T>;
  describe (): JSONSchema7;
}

export type TypeNames = JSONSchema7TypeName|'unknown';

export type TypeMapping = {
  string: string;
  number: number;
  integer: number;
  boolean: boolean;
  object: Object;
  array: any[];
  null: null;
  unknown: unknown;
}

export interface CoreSchemaSettings extends JSONSchema7 {
  properties: {
    [key: string]: JSONSchema7 & {
      type?: TypeNames;
      resolve?: SchemaPropertyFunction<any>;
      validate?: SchemaPropertyFunction<any>;
    }
  }
}

export type Infer<T extends { _type: any }> = T['_type'];
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
export type CoreSchemaType<T extends CoreSchemaSettings> = {
  [M in keyof T['properties']]: (
    T['properties'][M]['resolve'] extends SchemaPropertyFunction<any> ?
    ThenArg<ReturnType<T['properties'][M]['resolve']>> : (
      T['properties'][M]['validate'] extends SchemaPropertyFunction<any> ?
      ThenArg<ReturnType<T['properties'][M]['validate']>> :
      TypeMapping[T['properties'][M]['type']]
    )
  );
}

export class CoreSchema<V, C, T extends CoreSchemaSettings> implements Schema<CoreSchemaType<T>, V, C> {
  readonly schema: T;
  readonly _type!: CoreSchemaType<T>;

  constructor (schema: T) {
    this.schema = schema;
  }

  async resolve (data: V, context: C, metadata: SchemaMetadata<V>) {
    const { properties = {} } = this.schema;
    const keys = Object.keys(properties) as (keyof V & keyof (typeof properties))[];
    const results = await Promise.all(keys.map(async name => {
      const { validate } = properties[name];
      const value = data[name];
      
      if(typeof validate === 'function') {
        return validate(value, data, context, metadata);
      }

      return value;
    }));

    return keys.reduce((current, name, index) => {
      const value = results[index];

      if (value !== undefined) {
        (current as any)[name] = results[index];
      }

      return current;
    }, {}) as CoreSchemaType<T>
  }

  async validate (data: V, context: C, metadata: SchemaMetadata<V>) {
    const { properties = {} } = this.schema;
    const keys = Object.keys(properties) as (keyof V & keyof (typeof properties))[];
    const results = await Promise.allSettled(keys.map(async name => {
      const { validate } = properties[name];
      const value = data[name];
      
      if(typeof validate === 'function') {
        return validate(value, data, context, metadata);
      }

      return value;
    }));
    const errors = results.reduce((errors, value, index) => {
      if (value.status === 'rejected') {
        const { reason } = value;
        const error = typeof reason.toJSON === 'function' ? reason.toJSON() : reason.message;

        errors[keys[index]] = error;
      }

      return errors;
    }, {} as any);

    if (Object.keys(errors).length) {
      throw new ValidationError('Can not resolve schema', { errors });
    }

    const list = (results as PromiseFulfilledResult<any>[]).map(({ value }) => value);

    return keys.reduce((result, name, index) => {
      const value = list[index];

      if (value !== undefined) {
        (result as any)[name] = list[index];
      }

      return result;
    }, {}) as CoreSchemaType<T>;
  }

  describe () {
    return this.schema;
  }
}

// class CombinedSchema<T, V, C> implements Schema<T, V, C> {
//   constructor() {

//   }
// }
