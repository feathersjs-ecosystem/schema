import { strict as assert } from 'assert';
import { schema, Type, validate } from '../src';

describe('@feathersjs/schema', () => {
  it('simple schema and validation', async () => {
    const User = schema({
      name: 'users'
    }, {
      email: {
        type: Type.string().email().required()
      },
      age: {
        type: Number
      },
      enabled: {
        type: Boolean
      }
    });

    const validated = await User.validate({
      age: '33',
      enabled: 'false',
      email: 'someone@somewhere.com'
    });

    assert.deepEqual(validated, {
      age: 33,
      enabled: false,
      email: 'someone@somewhere.com'
    });

    await assert.rejects(() => User.validate({
      email: 'Here'
    }), {
      message: '"email" must be a valid email'
    });
  });

  it('schema on target', async () => {
    class Tester {}

    schema(Tester, {
      name: 'test'
    }, {
      age: {
        type: Number
      }
    });

    const Related = schema({
      name: 'related-test'
    }, {
      test: {
        type: Tester
      }
    });

    const validated = await Related.validate({
      test: { age: '444' }
    });

    assert.deepEqual(validated, { test: { age: 444 } });
    assert.deepEqual(await validate({
      age: '123'
    }, Tester), {
      age: 123
    });
  });

  it('related schemas and validation', async () => {
    const Todo = schema({
      name: 'todo'
    }, {
      text: {
        type: Type.string().required()
      }
    });
    const User = schema({
      name: 'users'
    }, {
      age: {
        type: Type.number().required().integer()
      },
      todos: {
        type: [ Todo ]
      }
    });

    const validated = await User.validate({
      age: '23',
      todos: [{
        text: 'Hello'
      }]
    });

    assert.deepEqual(validated, {
      age: 23,
      todos: [ { text: 'Hello' } ]
    });
  });
});
