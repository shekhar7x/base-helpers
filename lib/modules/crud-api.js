
const { validation } = require('../utils/route-utils');
const joi = require('joi');
const S = require('string')

class CrudApi {
    constructor(
        controller,
        defaultAuthentication = false,
        defaultAuthorization = false,
        idType = 'mongo'
    ) {
        this.controller = controller;
        let idValidations = {
            'mongo': validation.resourceMongooseId,
            'string': joi.string().required(),
            'number': joi.number().required()
        }
        this.idValidation = idValidations[idType];
        this.name = this.controller.name,
            this.defaultAuthentication = defaultAuthentication;
        this.defaultAuthorization = defaultAuthorization;
    }
    getDefaultApi(method = 'GET', idRequired = false, body, query, action, handler) {
        action = S(action || '').humanize().s
        let api = {
            method,
            path: idRequired ? '/:id' : '/',
            schema: {
                ...(method !== 'GET' && body ? { body } : {}),
                query,
                params: idRequired ? { id: this.idValidation } : {},
                description: `Perform ${action} action on ${this.name}`
            },
            authenticate: this.defaultAuthentication,
            authorize: this.defaultAuthorization,
            autoHandleResponse: true,
            handleResponseFormat: true,
            handler: handler || (async () => { return 'Api in progress!' })
        };
        return api;
    }
    getCreateApi(body) {
        return this.getDefaultApi('POST', false, body, {}, 'create', this.controller.create.bind(this.controller))
    }
    getFindAllApi(query) {
        return this.getDefaultApi('GET', false, {}, query, 'findAll', this.controller.findAll.bind(this.controller))
    }
    getFindByIdApi() {
        return this.getDefaultApi('GET', true, {}, {}, 'findById', this.controller.findById.bind(this.controller))
    }
    getUpdateByIdApi(body) {
        return this.getDefaultApi('PATCH', true, body, {}, 'findById', this.controller.updateById.bind(this.controller))
    }
    getreplaceByIdApi(body) {
        return this.getDefaultApi('PUT', true, body, {}, 'replaceById', this.controller.replaceById.bind(this.controller))
    }
    getDeleteByIdApi(query, softDelete = true) {
        if (softDelete) {
            query = {
                hardDelete: joi.boolean().default(false).description('permanently delete resource')
            }
        }
        return this.getDefaultApi('DELETE', true, {}, query, 'deteteById', this.controller.deleteById.bind(this.controller))
    }
}

module.exports = CrudApi;