import { strict as assert } from 'assert';
import { Sequelize } from 'sequelize';
import { resolve } from '@feathersjs/schema';

import { convert, associate } from '../src';
import { User, Todo } from './schemas';

describe('@feathersjs/schema-sequelize', () => {
  it('initializes a model', async () => {
    const client = new Sequelize('sqlite://test-db.sqlite');

    const UserModel = convert (User, client);
    const TodoModel = convert(Todo, client);

    associate(client);

    await client.sync();

    assert.ok(UserModel);
    assert.ok(TodoModel);

    const user: any = await UserModel.create({
      email: 'dave@test.com',
      age: 22
    });
    const todo = await TodoModel.create({
      text: 'Test todo',
      userId: user.id,
      valid: 'custom type'
    });

    const resolvedTodo: any = await resolve(todo.toJSON(), Todo, client.models);

    assert.ok(resolvedTodo.id);
    assert.ok(resolvedTodo.user);
    assert.equal(resolvedTodo.user.email, 'dave@test.com');
    assert.equal(resolvedTodo.valid, 'custom type');
  });
});
