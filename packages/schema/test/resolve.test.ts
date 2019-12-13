import { strict as assert } from 'assert';
import { schema, Type, resolve } from '../src';

describe('@feathersjs/schema resolvers', () => {
  it('general schema resolvin, avoids circular dependencies', async () => {
    const User = schema({
      name: 'resolve-users'
    }, {
      id: {
        type: Number
      },
      name: {
        type: String
      },
      email: {
        type: Type.string().email().required()
      },
      todos: {
        type: [ 'resolve-todos' ],
        async resolve (user: any, ctx: any) {
          return ctx.todos.filter((todo: any) => todo.userId === user.id);
        }
      }
    });

    const Todo = schema({
      name: 'resolve-todos'
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
      }],
      todos: [{
        text: 'My todo',
        userId: 15
      }, {
        text: 'My other todo',
        userId: 12
      }]
    };
    const todo = ctx.todos[0];
    const resolvedTodo = await resolve(todo, Todo, ctx);

    assert.deepEqual(resolvedTodo, {
      text: 'My todo',
      userId: 15,
      user: {
        id: 15,
        name: 'Joe',
        email: 'joe@example.com',
        todos: [ ctx.todos[0] ]
      }
    });

    const user = ctx.users[0];
    const resolvedUser = await resolve(user, User, ctx, [ Todo.properties.user ]);

    assert.deepEqual(resolvedUser, {
      id: 12,
      name: 'Dave',
      email: 'dave@example.com',
      todos: [ ctx.todos[1] ]
    });
  });
});
