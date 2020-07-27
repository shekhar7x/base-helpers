class BaseHttpErrors {
    constructor() {
        this.modelName = 'Resource';
    }
    async throwError(message, statusCode) {
        throw Object.assign(
            new Error(message || 'Something went wrong!'),
            { statusCode: statusCode || 500 }
        );
    }
    async throwIfNotFound(doc, message) {
        if (!doc) {
            message = message || `${this.modelName} doesn't exist!`;
            await this.throwError(message, 404);
        }
    }

    async throwValidationError(message = 'Invalid request payload!') {
        await this.throwValidationError(message, 400);
    }

    async throwUnAuthenticatedError(message = 'Anauthicated user!') {
        await this.throwError(message, 401);
    }
    async throwForbiddenError(message = 'Access denied!') {
        await this.throwError(message, 403)
    }

    async throwConflictError(message = 'Resource Conflict') {
        await this.throwError(message, 409)
    }
}

module.exports = { BaseHttpErrors };