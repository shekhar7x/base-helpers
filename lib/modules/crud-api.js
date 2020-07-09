
const { validation } = require('../utils/route-utils');
const joi = require('joi');
const S = require('string')
const _ = require('lodash')
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
    getDefaultApi(method = 'GET', idRequired = false, body, query, action, handler, description) {
        action = S(action || '').humanize().s
        let defaultDescription = `Perform ${action} action on ${this.name}`;
        let api = {
            method,
            path: idRequired ? '/:id' : '/',
            schema: {
                ...(method !== 'GET' && body ? { body } : {}),
                query,
                params: idRequired ? { id: this.idValidation } : {},
                description: description || defaultDescription
            },
            authenticate: this.defaultAuthentication,
            authorize: this.defaultAuthorization,
            autoHandleResponse: true,
            handleResponseFormat: true,
            handler: handler || (async () => { return 'Api in progress!' })
        };
        return api;
    }
    getCreateApi(body, description) {
        return this.getDefaultApi('POST', false, body, {}, 'create', this.controller.create.bind(this.controller), description)
    }
    getIncludeQueryParams() {
        let includeParams = _.get(this, 'controller.module.lookupEnums');
        if (includeParams instanceof Array && includeParams.lookups.length) {
            return { include: joi.array().items(joi.valid(includeParams)) }
        }
    }
    getFindAllApi(query, description) {
        let include = this.getIncludeQueryParams();
        return this.getDefaultApi('GET', false, {}, { ...include, ...(query || {}) }, 'findAll', this.controller.findAll.bind(this.controller), description);
    }
    getFindByIdApi(description) {
        return this.getDefaultApi('GET', true, {}, {}, 'findById', this.controller.findById.bind(this.controller), description);
    }
    getUpdateByIdApi(body, description) {
        return this.getDefaultApi('PATCH', true, body, {}, 'findById', this.controller.updateById.bind(this.controller), description);
    }
    getreplaceByIdApi(body, description) {
        return this.getDefaultApi('PUT', true, body, {}, 'replaceById', this.controller.replaceById.bind(this.controller), description);
    }
    getDeleteByIdApi(query, softDelete = true, description) {
        if (softDelete) {
            query = {
                hardDelete: joi.boolean().default(false).description('permanently delete resource')
            }
        }
        return this.getDefaultApi('DELETE', true, {}, query, 'deteteById', this.controller.deleteById.bind(this.controller), description)
    }
}

module.exports = CrudApi;