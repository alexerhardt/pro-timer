/**
 * Wraps an API call in a Promise
 * @param apiCall
 * @param request
 * @returns {Promise}
 */
module.exports.wrapInPromise = function(apiCall, request) {
  return new Promise((resolve, reject) => {
    apiCall(request, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
};
