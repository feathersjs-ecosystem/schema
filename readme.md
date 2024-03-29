# Feathers Schema

> __Note:__ Development for this module has been moved to [feathersjs/feathers](https://github.com/feathersjs/feathers). See the [documentation](https://dove.docs.feathersjs.com/api/schema/) for usage information.

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
    type: Type.number().integer()
  },
  email: {
    type: Type.string().email().required(),
    description: 'The user email'
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  todos: {
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

const Todo = schema({
  name: 'todo'
}, {
  text: {
    type: String
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
  @property()
  id: number;

  @property(validator => validator.email().required())
  email: string;

  @property()
  firstName: string;

  @property()
  lastName: string;

  @property({
    type: [ 'todos' ], // Reference by schema name
    resolve: async (user, context) => {
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
  @property()
  text: string;

  @property()
  completed: boolean;

  @property(validator => validator.required())
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
