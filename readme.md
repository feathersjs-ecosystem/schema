# Feathers Schema

[![CI](https://github.com/feathersjs/schema/workflows/CI/badge.svg)](https://github.com/feathersjs/schema/actions?query=workflow%3ACI)

A common schema definition format for JavaScript and TypeScript that can target different formats like

- JSON schema
- GraphQL
- Mongoose
- Sequelize

## Example

### JavaScript

```js
const { schema, Type } = require('@feathersjs/schema');

const User = schema({
  name: 'user'
}, {
  id: {
    type: string,
    value: required()
  },
  tags: {
    type: array(),
    value: string()
  },
  email: {
    type: string(),
    value: required(email(async (value, user, context, metadata) => {

    })),
    resolve (value, user, context) {
      if (context.params.provider) {
        return undefined;
      }

      return value;
    },
    description: 'The user email',
  },
  firstName: {
    type: Type.string()
  },
  lastName: {
    type: Type.string()
  },
  todo: {
    type: references('todo')
  },
  todos: {
    type: array(references('todo')),
    value: array(ref('todo')),
    type: [ 'todo' ], // Use schema name to get around circular dependencies
    async resolve (user, context) {
      const { params: { query = {} }, app } = context;

      return app.service('todos').find({
        paginate: false,
        query: {
          ...query,
          userId: user.id
        }
      });
    }
  }
});

const User = schema({
  name: 'user'
}, {
  id: {
    type: Type.number().integer()
  },
  email: {
    type: Type.string().email().required(),
    description: 'The user email'
  },
  firstName: {
    type: Type.string()
  },
  lastName: {
    type: Type.string()
  },
  todos: {
    value: ref('todo'),
    // type: [ 'todo' ], // Use schema name to get around circular dependencies
    async resolve (user, context) {
      const { params: { query = {} }, app } = context;

      return app.service('todos').find({
        paginate: false,
        query: {
          ...query,
          userId: user.id
        }
      });
    }
  }
});

const Todo = schema({
  name: 'todo'
}, {
  text: {
    type: 'string',
    async value (value, todo, context) {

    },
    async resolve (value, todo, context) {

    }
  },
  completed: {
    type: Boolean
  },
  userId: {
    type: Number
  },
  user: {
    type: User, // Can use direct reference here
    resolve: async (todo, context) => {
      const { params, app } = context;

      return app.service('users').get(todo.userId, params);
    }
  }
});
```

### TypeScript

Schemas can be declared using decorators

```ts
const { property, schema, Type } = require('@feathersjs/schema');

@schema({
  name: 'users'
})
class User {
  @property(integer())
  id: number;

  @property(required(email()))
  email: string;

  @property()
  firstName: string;

  @property()
  lastName: string;

  @property({
    value: references('todos'),
    resolve: async (value, user, context) => {
      const { params: { query = {} }, app } = context;

      return app.service('todos').find({
        paginate: false,
        query: {
          ...query,
          userId: user.id
        }
      });
    }
  })
  todos: Todo[];
}

@schema({
  name: 'todos'
})
class Todo {
  @property(value => value(required(), regex(/fdjskl/)))
  text: string;

  @property(value => value(default(false)))
  completed: boolean;

  @property(validator => validator(required()))
  userId: User['id'];
  
  @property({
    resolve: async (todo, context) => {
      const { params, app } = context;

      return app.service('users').get(todo.userId, params);
    }
  })
  user: User;
}
```
