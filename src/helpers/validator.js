const Validator = require('fastest-validator');
const validator = new Validator()

module.exports = (schema, input) => {
  const check = validator.compile(schema);
  return check(input)
}
