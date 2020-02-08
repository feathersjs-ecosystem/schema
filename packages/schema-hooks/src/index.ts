import { HookContext } from '@feathersjs/feathers';
import { resolve, getSchema } from '@feathersjs/schema';
import { FeathersError } from '@feathersjs/errors';

export class ValidationError extends FeathersError {
  readonly details: any;

  constructor (message: string, details: any, data?: any) {
    super(message, 'validation-error', 400, 'ValidationError', {
      errors: details,
      ...data
    });
  }
}

export const validateSchema = (options?: any) => {
  return async (context: HookContext) => {
    const { service, data } = context;
    const schema = getSchema(service?.options?.Schema || service.Schema);

    if (schema && data) {
      try {
        context.data = await schema.validate(data, {
          abortEarly: false,
          context,
          ...options
        });
      } catch (error) {
        if (error.details) {
          throw new ValidationError(error.message, error.details, data);
        }

        throw error;
      }
    }
  };
};

export const resolveSchema = () => {
  return async (context: HookContext) => {
    const { result, method, service } = context;
    const schema = getSchema(service?.options?.Schema || service.Schema || service);

    if (method === 'find' && result.data) {
      context.result.data = await resolve(result.data, schema, context);
    } else {
      context.result = await resolve(result, schema, context);
    }

    return context;
  };
};
