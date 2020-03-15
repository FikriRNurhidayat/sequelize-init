module.exports = [

  /* Internal Server Error Handler */
  function InternalServerError(err, req, res, _) {
    /*
     * Check if status code already defined
     * If it is not defined that
     * it must be from unexpected error
     * */
    if (res.statusCode === 200)
      res.status(500);

    /*
     * Check if the error comes from next of throw
     * It will set the error message accordingly
     * */
    var message = err instanceof Error ? err.message : err;

    res.json({
      status: false,
      errors: message
    })
  },
  /* End of Internal Server Error Handler */

  /* Not Found Handler */ 
  function NotFound(req, res) {
    res.status(404).json({
      status: false,
      errors: 'Are you lost?'
    })
  }
  /* End of Not Found Handler */ 

]
