# Feathers Schema

A comman schema definition format for JavaScript and TypeScript that can target different formats like

- JSON schema
- GraphQL
- Mongoose
- Sequelize

## Example

### JavaScript

```js
const { setSchema } = require('@feathersjs/schema');

class User {}

setSchema(User, {
  id: {
    type: Number
  },
  email: {
    description: 'The user email',
    type: String
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

class Todo {}

setSchema(Todo, {
  text: {
    type: String
  },
  completed: {
    type: Boolean,
    defaultValue: false
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
const { property } = require('@feathersjs/schema');

class User {
  @property()
  id: number;

  @property({
    description: 'The user email'
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

  @property({
    defaultValue: false
  })
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
