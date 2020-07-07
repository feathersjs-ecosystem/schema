export const required = chainableProperty<any> (
  <O, C> (value: any, _object: O, _context: C, _meta: SchemaMetadata) => {
    if (value === null || value === undefined) {
      throw new Error('Value is required');
    }

    return value;
  }, {
    required: true
  }
);


function integerValue<O, C> (value: any, _object: O, _context: C, _meta: SchemaMetadata) {
  if (value === null || value === undefined) {
    return value;
  }

  const result = parseInt(value, 10);

  if (isNaN(result)) {
    throw new Error('Value is not an integer');
  }

  return result as number;
}

export const integer = chainableProperty<number>(integerValue, {
  type: 'integer'
});
