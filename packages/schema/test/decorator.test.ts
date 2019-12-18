import { property, schema, getSchema } from '../src';
import { strict as assert } from 'assert';
import Joi = require('@hapi/joi');

describe('@feathersjs/schema decorator', () => {
  it('initializes with property decorators', async () => {
    @schema({
      name: 'todo'
    })
    class Todo {
      @property(validator => validator.required(), {})
      text: string;
    }

    @schema({
      name: 'test'
    })
    class Test {
      @property<Joi.NumberSchema> (validator => validator.integer())
      age: number;

      @property()
      todo: Todo;

      constructor (_age: number) {
        this.age = _age;
      }
    }

    assert.deepEqual(getSchema(Test).meta, {
      name: 'test'
    });

    const validated = await getSchema(Test).validate({
      age: '2134',
      todo: {
        text: 'testing'
      }
    });

    assert.deepEqual(validated, {
      age: 2134,
      todo: { text: 'testing' }
    });
  });
});
