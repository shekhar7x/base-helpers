const { request } = require('express');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

class BaseAuthorization {
    constructor() {
        this.roles = {}
    }

    /**
     * 
     * @param {*} role 
     * @param {(request: any)=>boolean} validator
     */
    registerDynamicRole(role = '', validator) {

    }
    /**
     * get middleware for authorization
     * @param {string[]} roles array of roles
     * @returns {(request:any,response: any,next: ()=>any)=>any} express.js middleware
     */
    authorize(roles, userRolePath = 'user.role') {
        return (request, response, next) => {
            let userRole = _.get(request, userRolePath);
            this.checkIfAuthorized(roles, request[userRolePath]).then(_ => {

            }).catch(e => {
                let error = Object.assign(new Error(''));
                next();
            })
        }
    }

    async checkIfAuthorized(roles, userRole) {

        await this.a
    }

    getForbiddenError(message = 'Forbidden Action!') {
        return Object.assign(new Error(message), { statusCode: 401 })
    }
}


module.exports = BaseAuthorization;