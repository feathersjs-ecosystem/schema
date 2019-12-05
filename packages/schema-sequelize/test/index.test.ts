import { strict as assert } from 'assert';
import { Type, schema, property } from '@feathersjs/schema';
import { convert } from '../src';
import { Sequelize } from 'sequelize';

describe('@feathersjs/schema-sequelize', () => {
  @schema({
    name: 'todo'
  })
  class User {
    @property({
      type: Type.string().email().required()
    })
    email: string;

    @property({
      type: Type.number().integer()
    })
    age: number;
  }

  it('initializes a model', async () => {
    const client = new Sequelize('sqlite://test-db.sqlite');

    const Model = convert(User, client);

    await client.sync();

    assert.ok(Model);
  });
});
