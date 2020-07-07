import { getSchema } from './core';

export async function resolve<T = any> (source: T, schemaTarget: any, context: any, path: any[] = []): Promise<T|T[]> {
  if (Array.isArray(source)) {
    return Promise.all(source.map((current: any) => resolve(current, schemaTarget, context, path)));
  }

  const isArray = Array.isArray(schemaTarget);
  const schema = getSchema(isArray ? schemaTarget[0] : schemaTarget);
  const { properties } = schema;
  const resolveKeys = Object.keys(properties).filter(key =>
    typeof properties[key].resolve === 'function' && !path.includes(properties[key])
  );

  if (resolveKeys.length) {
    const entities: any[] = await Promise.all(resolveKeys.map(async key => {
      const property = properties[key];
      const { resolve: resolver, type } = property;
      const entity = await resolver(source, context);

      return resolve(entity, type, context, path.concat(property));
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
