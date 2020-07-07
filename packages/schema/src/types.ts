import {
  SchemaFunction, SchemaPropertyMeta, typeMap
} from './core';

export function chainable<T = any, O = any, C = any> (
  spf: SchemaFunction<T, O, C>,
  descriptor?: { [key: string]: any }
) {
  return (next?: SchemaFunction) => {
    const fn = async (value: any, object: O, context: C, meta: SchemaPropertyMeta) => {
      const result = await spf(value, object, context, meta);
  
      if (typeof next === 'function') {
        return (await next(result, object, context, meta)) as T;
      }
      
      return result;
    };

    fn.toJSON = () => {
      return {
        ...(typeof next?.toJSON === 'function' && next.toJSON()),
        ...descriptor
      };
    };
  
    return fn;
  };
}

function booleanValue<O, C> (value: any, _object: O, _context: C, _meta: SchemaPropertyMeta) {
  if (value === true || value === 1 || value === 'true') {
    return true;
  }
  
  if (value === false || value === 0 || value === 'false') {
    return false;
  }

  if (value === null || value === undefined) {
    return value;
  }

  throw new Error('Not a valid boolean');
}

export const boolean = () => chainable<boolean>(booleanValue, {
  type: 'boolean'
});

function stringValue<O, C> (value: any, _object: O, _context: C, _meta: SchemaPropertyMeta) {
  if (typeof value !== 'string' && value !== null && value !== undefined) {
    throw new Error('Not a string');
  }

  return value;
}

export const string = () => chainable<string>(stringValue, {
  type: 'string'
});

function numberValue<O, C> (value: any, _object: O, _context: C, _meta: SchemaPropertyMeta) {
  if (typeof value === 'number' || value === null || value === undefined) {
    return value;
  }

  const result = parseFloat(value);

  if (isNaN(result)) {
    throw new Error('Value is not a number');
  }

  return result as number;
}

export const number = () => chainable<number>(numberValue, {
  type: 'number'
});

export function array<T, O = any, C = any> () {
  return (next?: SchemaFunction<T>) => {
    const fn = async (value: any, object: O, context: C, meta: SchemaPropertyMeta) => {
      if (!Array.isArray(value)) {
        throw new Error('Not an array');
      }

      const result = await Promise.all(value.map(current =>
        next(current, object, context, meta)
      ));

      return result;
    };

    fn.toJSON = () => {
      const {
        type = null, ...nextDescriptor
      } = typeof next?.toJSON === 'function' ? next.toJSON() : {};

      return {
        type: 'array',
        items: type,
        ...nextDescriptor
      };
    };

    return fn;
  }
}

// export function ref<T> (name: string) {
//   const fn = async (value: any, _object: O, context: C, _meta: SchemaPropertyMeta) => {
//     const schema = getSchema(name);

//     if (schema === null) {
//       throw new Error(`Schema ${name} in ref does not exist`);
//     }

//     return schema.value(value, context);
//   }

//   return fn;
// }

typeMap.set(String, string());
typeMap.set(Number, number());
typeMap.set(Boolean, boolean());
