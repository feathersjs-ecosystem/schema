

interface SchemaValue<T, D = { [key: string]: any }> {
  value: ValueFunction<T>;
  describe? (): D;
}

const integer = (options: any, next: ValueFunction) => {
  const validator = (value: any, object: O, context: C) => {
    return next(parseInt(value, 10), object, context);
  }

  validator.describe = { type: 'integer' };

  return validator;
}

class SchemaProperty {
  next?: SchemaProperty;

  constructor(next?: SchemaProperty) {
    this.next = next;
  }
}

class IntegerValue implements SchemaValue<number> {
  value () {

  }

  describe () {
    return { type: 'integer' };
  }
}

export interface SchemaProperties {
  [key: string]: SchemaPropertyDefinition;
}

class Schema {
  
}
