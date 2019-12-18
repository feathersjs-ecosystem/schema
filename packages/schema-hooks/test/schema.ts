import Joi from '@hapi/joi';
import { schema, property } from '@feathersjs/schema';
import { HookContext } from '@feathersjs/feathers';

@schema({
  name: 'users'
})
export class User {
  @property<Joi.NumberSchema> (validator => validator.integer())
  id: number;

  @property<Joi.StringSchema> (validator => validator.email().required())
  email: string;

  @property (validator => validator.required())
  name: string;

  @property<Joi.NumberSchema> (validator => validator.integer())
  age: number;
}

@schema({
  name: 'todos'
})
export class Todo {
  @property<Joi.NumberSchema> (validator => validator.integer())
  id: number;

  @property()
  text: string;

  @property<Joi.NumberSchema> (validator => validator.integer().required(), {
    value (_userId: number, _todo: Todo, context: HookContext) {
      return context.params?.user?.id;
    }
  })
  userId: number;

  @property({
    async resolve (todo: Todo, context: HookContext) {
      const { query, ...params } = context.params;

      return context.app.service('users').get(todo.userId, params);
    }
  })
  user: User;
}
