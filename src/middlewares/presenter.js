module.exports = (req, res, next) => {
  /*
   * Check if response already has body
   * If it doesn't then return next,
   * so this request will be handled
   * by NotFound Handler
   * rather then not having any response
   * */
  if (!res.body) {
    return next()
  }

  /*
   * If response has body,
   * then we will present the response
   * */
  return res.json({
    status: true,
    data: res.body
  })
}
