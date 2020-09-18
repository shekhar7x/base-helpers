class BaseAuthentication {
    constructor({
        secret = '9pdpEXQfjYax2arAAzYmK7!Uh6w#RnUphSvwqHTeqDtQ49%V9d'
    }) {
        this.secret = secret;
    }
    decodeToken(token) {
        return jwt.verify(token, config.jwtSecretKey);
    }

    encodeToken(payload) {
        return jwt.sign(payload, config.jwtSecretKey);
    }

    /**
     * get middleware for authentication
     * @param {'required'| 'optional'} stategy 
     */
    authenticate(stategy = 'required') {
        return (request, response, next) => {
            this.checkAuthentication(strategy, request).then(user => {
                request.user = user
                next()
            }).catch(e => {
                next(e)
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
            if (stategy === 'required') {
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