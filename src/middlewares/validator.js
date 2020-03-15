const {
  validator,
} = require('../helpers/index.js')

/*
 * Function that will validate the request
 * It will require schema, that you will define on the router
 * See ../router/authRouter.js to 
 * */
module.exports = (schema) => {
  return function(req, res, next) {
    const isValid = validator(schema, req.body);
    if (isValid !== true) {
      res.status(400);
      next(isValid);
    } else {
      next()
    }
  }
}
