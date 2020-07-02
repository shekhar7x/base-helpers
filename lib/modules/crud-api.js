
const CrudControllerExpress = require('./crud-controller-express');
const { validation } = require('../utils/route-utils');
const joi = require('joi');
const S = require('string')

class CrudApi {
    constructor(
        controller,
        resourceName,
        defaultAuthentication = false,
        defaultAuthorization = false,
        idType = 'mongo'
    ) {
        this.controller = new CrudControllerExpress();
        let idValidations = {
            'mongo': validation.resourceMongooseId,
            'string': joi.string().required(),
            'number': joi.number().required()
        }
        this.idValidation = idValidations[idType];
        this.resourceName = resourceName,
            this.defaultAuthentication = defaultAuthentication;
        this.defaultAuthorization = defaultAuthorization;
    }
    getDefaultApi(method = 'GET', idRequired = false, body, query, action, handler) {
        action = S(action || '').humanize().s
        let api = {
            method: 'GET',
            path: idRequired ? '/:id' : '/',
            schema: {
                body,
                query,
                params: idRequired ? { id: this.idValidation } : {},
                description: `Perform ${action} action on ${this.resourceName}`
            },
            authenticate: this.defaultAuthentication,
            autoHandleResponse: this.defaultAuthorization,
            handler: handler || (async () => { return 'Api in progress!' });
        };
        return api;
    }
    getCreateApi(body) {
        return this.getDefaultApi('POST', false, body, {}, 'create',this.controller.create)
    }
    getFindAllApi(query) {
        return this.getDefaultApi('GET',false, {},query, 'findAll',this.controller.find)
    }
    getFindByIdApi() {

    }
    getUpdateByIdApi() {

    }
    getreplaceByIdApi() {

    }
    getDeleteByIdApi() {

    }
}

module.exports = CrudApi;