const router = require('express').Router();
const {
  authenticate,
  validator: validate,
} = require('../middlewares')
const {
  changePassword,
  login,
  me,
  register,
} = require('../controllers/authController.js');

router.post(
  '/register',

  validate({
    email: {
      type: 'email',
      required: true
    }, 
    password: {
      type: 'string',
      required: true
    }, 
    password_confirmation: {
      type: 'string',
      required: true
    } 
  }),

  register
);

router.post(
  '/login',

  validate({
    email: {
      type: 'email',
      required: true
    }, 
    password: {
      type: 'string',
      required: true
    }
  }),

  login
);

router.post(
  '/change-password',

  validate({
    old_password: {
      type: 'string',
      required: true
    },
    new_password: {
      type: 'string',
      required: true
    },
    new_password_confirmation: {
      type: 'string',
      required: true
    }
  }),

  // Call authenticate middleware to verify token
  authenticate,
  changePassword
)

router.get(
  '/me',
  authenticate,
  me
)

module.exports = router;
