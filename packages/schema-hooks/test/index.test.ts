import { strict as assert } from 'assert';

import feathers, { Application } from '@feathersjs/feathers';
import memory from 'feathers-memory';

import { resolveSchema, validateSchema } from '../src';
import { User, Todo } from './schema';

describe('@feathersjs/schema-hooks', () => {
  let app: Application;

  beforeEach(() => {
    app = feathers().use('/users', memory({
      // @ts-ignore
      Schema: User
    })).use('/todos', memory({
      // @ts-ignore
      Schema: Todo
    })).use('/dummy', {
      async get (id: string) {
        return { id };
      }
    });

    app.hooks({
      before: validateSchema(),
      after: resolveSchema()
    });
  });

  describe('validateSchema', () => {
    it('validation error', async () => {
      try {
        await app.service('users').create({
          age: '12',
          email: 'dave'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.name, 'validation-error');
        assert.equal(error.errors.length, 2);
        assert.equal(error.errors[0].message, '"email" must be a valid email');
        assert.equal(error.errors[1].message, '"name" is required');
      }
    });

    it('creates a new valid user with coerced data', async () => {
      const user = await app.service('users').create({
        email: 'dave@example.com',
        name: 'Dave',
        age: '54'
      });

      assert.deepEqual(user, {
        id: 0,
        email: 'dave@example.com',
        name: 'Dave',
        age: 54
      });
    });
  });

  describe('resolveSchema', () => {
    it('resolves a schema', async () => {
      const user = await app.service('users').create({
        email: 'todo@example.com',
        name: 'Todo Tester',
        age: '54'
      });
      const todo = await app.service('todos').create({
        text: 'The users todo',
        userId: user.id
      }, { user });

      assert.deepEqual(todo, {
        text: 'The users todo',
        userId: user.id,
        id: 0,
        user
      });
    });

    it('works on service without schema', async () => {
      const test = await app.service('dummy').get('test');

      assert.deepEqual(test, { id: 'test' });
    });
  });
});
