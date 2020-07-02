'use strict';

class HttpUtils {
  /**
   * function to convert an error into a readable form.
   * @param {} error 
   */
  convertErrorIntoReadableForm(error) {
    let errorMessage = '';
    if (error.message.indexOf("[") > -1) {
      errorMessage = error.message.substr(error.message.indexOf("["));
    } else {
      errorMessage = error.message;
    }
    errorMessage = errorMessage.replace(/[\"\[\]]/g, '');
    error.message = errorMessage;
    return error;
  }

  getSuccessResponse(data, message = 'Action successful!', statusCode = 200) {
    return { data, message, statusCode }
  }
}

module.exports = new HttpUtils();