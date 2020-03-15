const router = require('express').Router()
const {
  authenticate,
  validator: validate,
} = require('../middlewares');
const {
  middleware,
  create,
  find,
  update
} = require('../controllers/postController.js')

router.post(
  '/',

  validate({
    title: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      required: true
    }
  }),

  authenticate,
  create
)

router.get('/', find)
router.put(
  '/:id',

  validate({
    title: {
      type: 'string',
      optional: true
    },
    body: {
      type: 'string',
      optional: true
    }
  }),

  authenticate,
  middleware.setPost,
  update
)

module.exports = router;
