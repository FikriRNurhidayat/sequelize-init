const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  let { authorization } = req.headers;

  try { 
    /* Split by Bearer */
    let token = authorization.split('Bearer ')[1]
    /* Parse JWT token */
    let parsed = await jwt.verify(token, process.env.JWT_SIGNATURE_KEY);

    /* Find the owner of the token */
    req.user = await User.findOne({
      where: {
        id: parsed.id
      }
    })

    next()
  }

  /* Catch any error and will be considered as invalid token */
  catch(error) {
    res.status(401);
    next('Invalid token');
  }
}
