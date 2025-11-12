// Base class for HTTP error handling with standard status codes
class BaseHttpErrors {
    constructor() {
        this.modelName = 'Resource';
    }

    // Throws a custom error with HTTP status code
    async throwError(message, statusCode) {
        throw Object.assign(
            new Error(message || 'Something went wrong!'),
            { statusCode: statusCode || 500 }
        );
    }
    // Throws 404 error if document is not found
    async throwIfNotFound(doc, message) {
        if (!doc) {
            message = message || `${this.modelName} doesn't exist!`;
            await this.throwError(message, 404);
        }
    }

    // Throws 400 validation error
    async throwValidationError(message = 'Invalid request payload!') {
        await this.throwError(message, 400);
    }

    // Throws 401 authentication error
    async throwUnAuthenticatedError(message = 'Anauthicated user!') {
        await this.throwError(message, 401);
    }

    // Throws 403 forbidden error
    async throwForbiddenError(message = 'Access denied!') {
        await this.throwError(message, 403)
    }

    // Throws 409 conflict error
    async throwConflictError(message = 'Resource Conflict') {
        await this.throwError(message, 409)
    }
}

module.exports = { BaseHttpErrors };