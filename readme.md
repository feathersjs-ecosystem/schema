# Feathers Schema

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/schema.svg)](https://greenkeeper.io/)

A common schema definition format for JavaScript and TypeScript that can target different formats like

- JSON schema
- GraphQL
- Mongoose
- Sequelize

## Example

### JavaScript

```js
const { schema } = require('@feathersjs/schema');

class User {}

schema(User, {
  name: 'user'
}, {
  id: {
    type: Joi.number().integer()
  },
  email: {
    type: Joi.string().email().required(),
    description: 'The user email'
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  todos: {
    type: [ Todo ],
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
    type: User,
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

  @property({
    type: Type.string().email().required()
  })
  email: string;

  @property()
  firstName: string;

  @property()
  lastName: string;

  @property({
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

class Todo {
  @property()
  text: string;

  @property()
  completed: boolean;

  @property()
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



```ts
@hooks([
  useSchema('data', userSchema)
])
class MyService {
  @hooks([
    useSchema('params.query', querySchema)
  ])
  find(params) {

  }
}
```
