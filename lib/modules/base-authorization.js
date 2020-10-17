const _ = require('lodash');


class BaseAuthorization {
    constructor() {
        /**
         * @type {{[key:string]:(request:any)=>boolean}}
         */
        this.dynamicRoles = {}
    }

    /**
     * 
     * @param {*} role 
     * @param { (request: any) => boolean } validator
     */
    registerDynamicRole(role = '', validator) {
        this.dynamicRoles[role] = validator;
    }
    /**
     * get middleware for authorization
     * @param {string[]} roles array of roles
     * @returns {
     *  ( request: any, response: any, next: () => any )=>any
     * } express.js middleware
     */
    authorize(rolesAllowed, userRolePath = 'user.role') {
        return (request, response, next) => {
            this.checkIfAuthorized(rolesAllowed, userRolePath, request).then(_ => {
                next();
            }).catch(e => {
                next(e);
            })
        }
    }

    async checkIfAuthorized(rolesAllowed = [], userRolePath, request) {
        let userRole = _.get(request, userRolePath)
        if (rolesAllowed.includes(userRole)) return;
        let isAuthorized = (await Promise.all(rolesAllowed.map(async roleAllowed => {
            if (!!this.dynamicRoles[roleAllowed]) {
                return await this.dynamicRoles[roleAllowed](request);
            }
            return false;
        }))).some(val => (val === true));
        if (!isAuthorized) await this.throwForbiddenError();
    }

    async throwForbiddenError(message = 'Forbidden Action!') {
        throw Object.assign(new Error(message), { statusCode: 401 })
    }
}


module.exports = BaseAuthorization;