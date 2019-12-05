import { strict as assert } from 'assert';
import { schema, Type, resolve } from '../src';

describe('@feathersjs/schemar resolvers', () => {
  it('simple schema resolving', async () => {
    const User = schema({
      name: 'users'
    }, {
      id: {
        type: Number
      },
      name: {
        type: String
      },
      email: {
        type: Type.string().email().required()
      }
    });

    const Todo = schema({
      name: 'todo'
    }, {
      text: {
        type: Type.string().required()
      },

      userId: {
        type: Number
      },

      user: {
        type: User,
        async resolve (todo: any, context: any) {
          return context.users.find((user: any) => user.id === todo.userId);
        }
      }
    });

    const ctx = {
      users: [{
        id: 12,
        name: 'Dave',
        email: 'dave@example.com'
      }, {
        id: 15,
        name: 'Joe',
        email: 'joe@example.com'
      }]
    };
    const todo = {
      text: 'My todo',
      userId: 15
    };
    const resolved = await resolve(todo, Todo, ctx);

    assert.deepEqual(resolved, {
      text: 'My todo',
      userId: 15,
      user: { id: 15, name: 'Joe', email: 'joe@example.com' }
    });
  });
});
