const j2s = require('./joi-to-swagger');
let singleton = undefined;

class Swagger {
    constructor() {

    }

    static instance() {
        if (!singleton) {
            singleton = new Swagger();
            singleton.currentRoute = [];
            singleton.paths = {};
            singleton.definitions = {};
            return singleton;
        }

        return this;
    }

    createJsonDoc(swaggerSpec, info, host, basePath) {
        let swaggerData = swaggerSpec;

        if (info) {
            swaggerData = {
                ...swaggerData,
                info
            }
        }

        if (host) {
            swaggerData = {
                ...swaggerData,
                host
            }
        }

        if (basePath) {
            swaggerData = {
                ...swaggerData,
                basePath
            }
        }

        return swaggerData;
    }

    addNewRoute(joiDefinitions, path, method, swaggerData) {

        if (this.currentRoute.includes(path + method)) {

            return false;
        }

        this.currentRoute.push(path + method);

        const otherData = swaggerData;
        const name = joiDefinitions.model || Date.now();
        const tag = joiDefinitions.group || 'default';
        const summary = joiDefinitions.description || 'No desc';

        const toSwagger = j2s(joiDefinitions).swagger;
        if (toSwagger && toSwagger.properties && toSwagger.properties.body) {
            this.definitions = {
                ...this.definitions,
                [name]: toSwagger.properties.body
            }
        }

        const pathArray = path.split('/').filter(Boolean);
        const transformPath = pathArray.map((path) => {
            if (path.charAt(0) === ':') {
                return `/{${path.substr(1)}}`;
            }

            return `/${path}`;
        })
            .join('');

        const parameters = [];

        const { body, params, query, headers } = joiDefinitions;

        if (body) {
            parameters.push({
                "in": "body",
                "name": "body",
                // ...toSwagger.properties.body
                "schema": {
                    "$ref": `#/definitions/${name}`
                }
            })
        }

        if (params) {
            const getParams = [];
            const rxp = /{([^}]+)}/g;
            let curMatch;

            while (curMatch = rxp.exec(transformPath)) {
                getParams.push(curMatch[1]);
            }
            let requiredFields = toSwagger.properties.params.required;
            getParams.forEach((param) => {

                let index = requiredFields ? requiredFields.findIndex(key => key === param) : -1;

                if (index > -1) {
                    toSwagger.properties.params.properties[param].required = true;
                }
                parameters.push({
                    "name": param,
                    "in": "path",
                    ...toSwagger.properties.params.properties[param]
                })
            })

        }

        if (query) {
            const keys = Object.keys(toSwagger.properties.query.properties).map((key) => key);
            let requiredFields = toSwagger.properties.query.required;
            keys.forEach((key) => {
                let index = requiredFields ? requiredFields.findIndex(requiredKey => requiredKey === key) : -1;
                if (index > -1) {
                    toSwagger.properties.query.properties[key].required = true;
                }
                parameters.push({
                    "in": "query",
                    "name": key,
                    ...toSwagger.properties.query.properties[key]
                })
            })
        }

        if (headers) {
            const keys = Object.keys(toSwagger.properties.headers.properties).map((key) => key);
            let requiredFields = toSwagger.properties.headers.required;
            keys.forEach((key) => {
                let index = requiredFields ? requiredFields.findIndex(requiredKey => requiredKey === key) : -1;
                if (index > -1) {
                    toSwagger.properties.headers.properties[key].required = true;
                }
                parameters.push({
                    "in": "header",
                    "name": key,
                    ...toSwagger.properties.headers.properties[key]
                })
            });
        }

        if (this.paths && this.paths[transformPath]) {
            this.paths[transformPath] = {
                ...this.paths[transformPath],
                [method]: {
                    "tags": [
                        tag
                    ],
                    summary,
                    responses:
                    {
                        200: {
                            description: "success"
                        }
                    },
                    parameters,
                }
            }
        } else {
            this.paths = {
                ...this.paths,
                [transformPath]: {
                    [method]: {
                        "tags": [
                            tag
                        ],
                        summary,
                        responses:
                        {
                            200: {
                                description: "success"
                            }
                        },
                        parameters,
                    }
                }
            }
        }

        const newData = {
            ...otherData,
            definitions: this.definitions,
            paths: this.paths
        };

        return newData;
    }
}
let routeToSwagger = {
    swaggerDoc: Swagger.instance()
}

module.exports = routeToSwagger;