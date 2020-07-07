import { strict as assert } from 'assert';
import { schema, string, number, boolean, getSchema, array, SchemaProperties } from '../src';

describe('@feathersjs/schema', () => {
  it('simple schema and types', async () => {
    const properties: SchemaProperties = {
      email: {
        type: string()
      },
      age: {
        type: number()
      },
      enabled: {
        type: boolean()
      }
    };

    // const x: Type = string;
    // type Props = {
    //   [m in keyof (typeof properties)]: (typeof properties)[m]['type']
    // };
    const UserSchema = schema({
      name: 'users'
    }, {
      email: {
        type: string()
      },
      age: {
        type: number()
      },
      enabled: {
        type: boolean()
      }
      // todo: {
        // type: ref<Todo> ('todo')
      // }
    });

    const validated = await UserSchema.value({
      age: '33',
      enabled: 'false',
      email: 'someone@somewhere.com'
    }, {});

    assert.deepEqual(validated, {
      age: 33,
      enabled: false,
      email: 'someone@somewhere.com'
    });

    assert.equal(getSchema('users'), UserSchema, 'getSchema with name');
    assert.equal(getSchema(null), null);
  });
});
