const {
  Post
} = require('../models');

exports.middleware = {
  /* To set the request post */
  async setPost(req, res, next) {
    if (!req.params.id) {
      res.status(400);
      return next('Post ID is required!')
    }

    try {
      req.post = await Post.findOne({
        where: { id: req.params.id }
      })
      return next()
    }

    catch(err) {
      res.status(404);
      return next('Post not found!')
    }
  }
  /* End of setPost */
}

exports.create = (req, res, next) => {
  Post.new({
    user: req.user,
    ...req.body
  })
    .then(data => {
      res.status(201);
      res.body = data;
      next()
    })
    .catch(err => {
      res.status(422);
      next(err)
    })
}

exports.find = (req, res, next) => {
  Post.all()
    .then(data => {
      res.status(200);
      res.body = data;
      next()
    })
    .catch(err => {
      res.status(400);
      next(err)
    })
}

exports.update = (req, res, next) => {
  /* 
    * Check if the one who tries to update the post is the owner of the post 
    * */
  if (req.post.user_id !== req.user.id) {
    res.status(403);
    return next('This is not your post!');
  }

  Post.edit(req.post.id, req.body)
    .then(() => {
      res.status(200);
      res.body = 'Post updated!';
      next()
    })
    .catch(err => {
      res.status(422);
      next(err)
    })
}
