import Joi from '@hapi/joi';
import { schema, property } from '@feathersjs/schema';

@schema({
  name: 'users'
})
export class User {
  @property<Joi.NumberSchema> (validator => validator.integer(), {
    sequelize: {
      primaryKey: true,
      autoIncrement: true
    }
  })
  id: number;

  @property<Joi.StringSchema> (validator => validator.email().required())
  email: string;
}

@schema({
  name: 'todos',
  sequelize (TodoModel: any, models: any) {
    TodoModel.belongsTo(models.users, { as: 'user' });
  }
})
export class Todo {
  @property<Joi.NumberSchema> (validator => validator.integer(), {
    sequelize: {
      primaryKey: true,
      autoIncrement: true
    }
  })
  id: number;

  @property(validator => validator.required())
  text: string;

  @property()
  userId: number;

  @property({
    async resolve (todo: any, context: any) {
      return context.users.findOne({
        raw: true,
        where: {
          id: todo.userId
        }
      });
    }
  })
  user: User;
}
