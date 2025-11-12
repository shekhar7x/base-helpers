const jwt = require('jsonwebtoken');
const _ = require('lodash');

// JWT-based authentication middleware and utilities
class BaseAuthentication {
    constructor({
        secret = '9pdpEXQfjYax2arAAzYmK7!Uh6w#RnUphSvwqHTeqDtQ49%V9d'  // Default JWT secret (should be overridden)
    }) {
        this.secret = secret;
    }

    // Verifies and decodes a JWT token
    decodeToken(token) {
        return jwt.verify(token, this.secret);
    }

    // Creates a new JWT token from payload
    encodeToken(payload) {
        return jwt.sign(payload, this.secret);
    }

    /**
     * Returns Express middleware for authentication
     * @param {"required" | "optional"} strategy - Authentication strategy
     */
    authenticate(strategy = 'required') {
        return (request, response, next) => {
            this.checkAuthentication(strategy, request).then(user => {
                request.user = user;
                next();
            }).catch(e => {
                next(e);
            })
        }
    }

    /**
     * authenticate 
     * @param {'required'| 'optional'} strategy
     * @param {*} request
     */
    async checkAuthentication(strategy = 'required', request) {
        try {
            let token = request.headers.authorization || request.headers.Authorization || '';
            token = token.replace(/^bearer\s/i, '');
            let decoded = this.decodeToken(token);
            return decoded;
        } catch (err) {
            if (strategy === 'required') {
                throw this.getAuthError()
            }
            let user = {
                _id: require('mongoose').Types.ObjectId(),
                role: 'anauthorized'
            }
            return user;
        }
    }

    getAuthError(message = 'Authentication Failed!') {
        return Object.assign(new Error(message), { statusCode: 401 })
    }
}


module.exports = BaseAuthentication;