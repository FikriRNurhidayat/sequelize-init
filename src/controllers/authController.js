const {
  User
} = require('../models')

/* Register Method */
exports.register = (req, res, next) => {
  // Call model to create user
  User.new(req.body)
    .then(({ id, email, createdAt, updatedAt }) => {
      res.status(201);
      res.body = { id, email, createdAt, updatedAt }
      next()
    })
    .catch(err => {
      res.status(422);
      next(err);
    })
}
/* End of Register Method */

/* Login Method */
exports.login = (req, res, next) => {
  // Call model to authenticate user
  User.authenticate(req.body.email, req.body.password)
    .then(user => {
      // Create token for authenticated user
      let token = user.createAccessToken()
      res.body = user.entity({ token })
      next()
    })
    .catch(err => {
      res.status(401);
      next(err);
    })
}
/* End of Login Method */

/* Reset Password Method*/
exports.changePassword = (req, res, next) => {
  let { user: current_user } = req;
  let { old_password, new_password, new_password_confirmation } = req.body;

  if (old_password === new_password) {
    res.status(400);
    return next("New password should not be same as old password!")
  }

  if (new_password !== new_password_confirmation) {
    res.status(400);
    return next("Password doesn't match with its confirmation");
  }

  current_user.setPassword(req.body)
    .then(isChanged => {
      res.status(200);
      res.body = "Password has successfully changed!"
      next()
    })
    .catch(err => {
      res.status(422);
      next(err)
    })
}
/* End of Reset Password Method*/

/* Current user method */
exports.me = (req, res, next) => {
  res.status(200);
  res.body = req.user.entity();
  next();
}
