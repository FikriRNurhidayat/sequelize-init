const router = require('express').Router();
const authRouter = require('./authRouter.js');
const postRouter = require('./postRouter.js');

router.use('/auth', authRouter);
router.use('/posts', postRouter);

module.exports = router;
