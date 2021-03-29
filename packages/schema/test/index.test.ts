import { strict as assert } from 'assert';
import { CoreSchema, Infer } from '../src';

describe('@feathersjs/schema', () => {
  describe('SchemaResolver', () => {
    type Todo = {
      name: string;
    };

    const UserSchema = new CoreSchema({
      id: 'user',
      properties: {
        lastName: { type: 'string' },
        active: { type: 'boolean' },
        age: {
          type: 'integer',
          async validate<T> (value: any, user: T) {
            const parsed = parseInt(value, 10);

            if (isNaN(parsed) || parsed < 0) {
              throw new Error('Invalid age');
            }

            return parsed;
          }
        },
        password: {
          type: 'string'
        },
        todos: {
          type: 'array',
          items: { $ref: '#todo' },
          resolve: async (value, user, context) => {
            return context.app.service('todos').find({
              paginate: false,
              query: { userId: user.id }
            }) as Todo[];
          }
        }
      }
    });
    
    type User = Infer<typeof UserSchema>;

    it('basic resolving', async () => {
      const resolved: User = await UserSchema.resolve({
        name: 'Dave',
        age: '333'
      }, {}, {});

      assert.deepEqual(resolved, {
        name: 'Dave',
        age: 333
      });
    });

    it('resolving with errors', async () => {
      try {
        await UserSchema.resolve({
          name: 'Davester'
        }, {}, {});
        assert.fail('Should never get here');
      } catch (error) {
        console.log(error);
      }
    });
  });
});
