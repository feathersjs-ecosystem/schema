import { getSchema } from './core';

export async function resolve<T = any> (source: T, schemaTarget: any, context: any) {
  const schema = getSchema(schemaTarget);
  const { properties } = schema;
  const resolveKeys = Object.keys(properties).filter(key => typeof properties[key].resolve === 'function');

  if (resolveKeys.length) {
    const entities: any[] = await Promise.all(resolveKeys.map(async key => {
      const property = properties[key];
      const { resolve: resolver, type } = property;
      const entity = await resolver(source, context);

      return resolve(entity, type, context);
    }));

    return resolveKeys.reduce((result, key, index) => {
      return {
        ...result,
        [key]: entities[index]
      };
    }, source);
  }

  return source;
}
