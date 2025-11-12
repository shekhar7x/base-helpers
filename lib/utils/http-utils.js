'use strict';

const { BaseHttpErrors } = require("./base-http-errors");

// Utility class for HTTP response formatting and error handling
class HttpUtils extends BaseHttpErrors {
  /**
   * Converts an error into a readable form by extracting and cleaning the message
   * @param {Error} error - The error object to format
   * @returns {Error} The formatted error object
   */
  convertErrorIntoReadableForm(error) {
    let errorMessage = '';
    // Extract message content within brackets if present
    if (error.message.indexOf("[") > -1) {
      errorMessage = error.message.substr(error.message.indexOf("["));
    } else {
      errorMessage = error.message;
    }
    // Remove brackets and quotes from error message
    errorMessage = errorMessage.replace(/[\"\[\]]/g, '');
    error.message = errorMessage;
    return error;
  }

  // Formats a successful response with data, message, and status code
  getSuccessResponse(data, message = 'Action successful!', statusCode = 200) {
    return { data, message, statusCode }
  }
}

module.exports = new HttpUtils();