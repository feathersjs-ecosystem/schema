import assert from 'assert';
import { init } from '../src';

describe('@feathersjs/schema', () => {
  it('initializes', () => {
    assert.strictEqual(init(), 'Hello world');
  });
});
