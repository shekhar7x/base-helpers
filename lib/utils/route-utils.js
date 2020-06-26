'use strict';

const swaggerUI = require('swagger-ui-express');
const routeToSwagger = require('./route-to-swagger');
const errorUtils = require('./error-utils');
const Joi = require('joi');
const Mongoose = require('mongoose');
let baseSwaggerSpec = {
    swagger: "2.0",
    info: {
        version: "1.0.0",
        title: "Node Base",
        description: "Node Base",
        termsOfService: "http://swagger.io/terms/",
        contact: { "name": "Node Base" },
        license: { "name": "MIT" }
    },
    paths: {},
    definitions: {},
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"]
}


let routeUtils = {};


/**
 * function to create routes in the express.
 */
routeUtils.route = async (app, routes = []) => {
    routes.forEach(route => {
        let middlewares = [getValidatorMiddleware(route), ...(route.authenticate ? [route.authenticate] : [])];
        app.route(route.path)[route.method.toLowerCase()](...middlewares, getHandlerMethod(route));
    });
    createSwaggerUIForRoutes(app, routes);
};

/**
 * attach default properties with routes
 * @param {Object} config 
 */
routeUtils.enhanceConfig = (config) => {
    let { basePath, routes } = config;
    let modelName = basePath.split("/")[basePath.split("/").length - 1];
    modelName = modelName[0].toUpperCase() + modelName.slice(1);
    routes.forEach(route => {
        route.method = route.method || "GET";
        route.schema = route.schema || {};
        route.schema.group = route.schema.group || modelName;
        route.schema.model = route.schema.model || `${modelName}.${route.method.toLowerCase()}.${route.path}`;
        route.path = basePath + route.path;
    })
}

/**
 * function to validate request body/params/query/headers with joi schema to validate a request is valid or not.
 * @param {*} route 
 */
let joiValidatorMethod = async (request, route) => {
    let supportedRequestKeys = ["params", "body", "query", "header"];
    await Promise.all(supportedRequestKeys.map(key => validateKeysUsingJoi(key, request, route)));
};

/**
 * validate and update the request according to joi schema
 * @param {*} key 
 * @param {*} request 
 * @param {*} route 
 */
let validateKeysUsingJoi = async (key, request, route) => {
    if (route.schema[key] && Object.keys(route.schema[key]).length) {
        let validatedData = await Joi.validate(request[key], route.schema[key]);
        request[key] = { ...(request[key] || {}), ...(validatedData || {}) };
    }
};

/**
 * middleware to validate request body/params/query/headers with JOI.
 * @param {*} route 
 */
let getValidatorMiddleware = (route) => {
    return (request, response, next) => {
        joiValidatorMethod(request, route).then((result) => {
            return next();
        }).catch((err) => {
            let error = errorUtils.convertErrorIntoReadableForm(err);
            let responseObject = {
                statusCode: 400,
                message: error.message
            };
            return response.status(responseObject.statusCode).json(responseObject);
        });
    };
}

/**
 * middleware
 * @param {*} handler 
 */
let getHandlerMethod = (route) => {
    let handler = route.handler
    return (request, response) => {
        handler(request, response, next)
            .then((result) => {
                if (route.autoHandleResponse === false) {
                    return;
                }
                response.status(result.statusCode).json(result);
            })
            .catch((err) => {
                if (!err.statusCode && !err.status) {
                    console.log('[INTERNAL_SERVER_ERROR]', err);
                    err = Object.assign(new Error, {
                        statusCode: 500,
                        message: 'Something went wrong!'
                    });
                }
                response.status(err.statusCode).json(err);
            });
    };
};

/**
 * function to create Swagger UI for the available routes of the application.
 * @param {*} app Express instance.
 * @param {*} routes Available routes.
 */
let createSwaggerUIForRoutes = (app, routes = [], baseSpec = baseSwaggerSpec) => {
    let swaggerSpec = routeToSwagger.swaggerDoc.createJsonDoc(baseSpec);
    routes.forEach(route => {
        swaggerSpec = routeToSwagger.swaggerDoc.addNewRoute(route.schema, route.path, route.method.toLowerCase(), swaggerSpec);
    });
    app.use('/documentation', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};


let setMongooseId = () => {
    let joiObject = Joi.string()
    joiObject.mongooseId = function () {
        return this._test('mongodbId', undefined, function (value, state, options) {
            return Mongoose.Types.ObjectId(value);
        })
    }
    return joiObject.mongooseId();
}

/**
 * convert string to Title case
 */
let setTitleCase = () => {
    let joiObject = Joi.string()
    joiObject.titleCase = function () {
        return this._test('mongodbId', undefined, function (value, state, options) {
            if (!!value) {
                return ('' + value).split(' ').map(str => str.trim()).filter(str => !!str).map(str => { return str[0].toUpperCase() + str.slice(1) }).join(' ')
            } else {
                return value
            }
        })
    }
    return joiObject.titleCase();
}

/**
 * common validation Joi condition utilities.
 */
routeUtils.validation = {
    titleCase: setTitleCase(),
    mongooseId: setMongooseId().error(new Error('invalid mongoose id')),
    resourceMongooseId: setMongooseId().required().error(new Error('invalid resource id')).description('mongodb Id of resource to get/update/delete'),
    numberConvert: Joi.number().options({ convert: true }),
    statusSetter: Joi.bool().optional().description('true - enable resource, false - deactivate resource (soft delete)'),
    arrayWithEnumStrings: (enums, minItems, maxItems) => {
        let validArray = Joi.array().items(Joi.string().valid(Object.values(enums))).description(stringArrayDescription(enums, minItems, maxItems))
        if (minItems) { validArray = validArray.min(minItems) };
        if (maxItems) { validArray = validArray.max(maxItems) };
        return validArray;
    },
    numberEnums: enums => Joi.number().valid(Object.values(enums)).options({ convert: true }).description(getEnumDescription(enums)),
    get paginator() {
        return {
            sortDirection: this.numberEnums(-1, 1),
            sortKey: Joi.string().optional().description('specify key to sort on basis of e.g. "keyname" for ascending,"-keyname" for descending '),
            index: this.numberConvert.optional().default(0).description('start index of records to fetch'),
            limit: this.numberConvert.optional().default(20).description('limit of number of records to fetch'),
        }
    },
    emptyString: Joi.string().allow('').optional()
}


/**
 * create description of Number Enums
 * @param {JSON} enumObject
 * @returns {String} description
 */
let getEnumDescription = (enumObject) => {
    let description = ''
    for (let key in enumObject) {
        description += `${enumObject[key]} - ${key} <br>`
    }
    return description;
}

/**
 * creates description.
 * 
 * @param {*} enumsArray
 * @param {*} minItems
 * @param {*} maxItems
 * @returns
 */
let stringArrayDescription = (enumsArray, minItems, maxItems) => {
    let description = ''
    if (!!minItems) description += ` minimum items = ${minItems}<br>`
    if (!!maxItems) description += ` maximum items = ${maxItems}<br>`
    description += 'example <br>[' +
        Object.keys(enumsArray).map(key => '"' + enumsArray[key] + '"').join('<br>') +
        ']';
    return description;
}


module.exports = routeUtils;