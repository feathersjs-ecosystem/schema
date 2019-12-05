import { Type, property, validate, schema, getSchema } from '../src';
import { strict as assert } from 'assert';

describe('@feathersjs/schema decorator', () => {
  it('initializes with property decorators', async () => {
    @schema({
      name: 'todo'
    })
    class Todo {
      @property({
        type: Type.string().required()
      })
      text: string;
    }

    @schema({
      name: 'test'
    })
    class Test {
      @property()
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

    const validated = await validate({
      age: '2134',
      todo: {
        text: 'testing'
      }
    }, Test);

    assert.deepEqual(validated, {
      age: 2134,
      todo: { text: 'testing' }
    });
  });
});
