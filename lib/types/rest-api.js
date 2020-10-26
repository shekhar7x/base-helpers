class RestApi {
    /**
     * 
     * @param {
        {
            method: string | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            path: string,
            schema: {
                body: {[property:string]: any},
                query: {[property:string]: any},
                params: {[property:string]: any},
                headers: {[property:string]: any},
                group: string,
                description: string,
                model: 'string'
            },
            
            authenticate: ()=>((request: any, response: any, next: () => undefined)),
            authorize: ()=>((request: any, response: any, next: () => undefined)),
            handler: ()=>Promise<{ [ property: string ]: any }>,
            handleResponseFormat: boolean,
            autoHandleResponse: boolean,
            subscriptionPath: string,
            restEnabled: boolean
        }
     } config configuration for apis
     */
    constructor({
        method = 'GET',
        path,
        schema,
        authenticate,
        authorize,
        handler,
        handleResponseFormat,
        autoHandleResponse,
        subscriptionPath,
        restEnabled,
    }) {
        this.method = method;
        this.path = path;
        this.schema = schema;
        this.authenticate = authenticate;
        this.authorize = authorize;
        this.handler = handler;
        this.handleResponseFormat = handleResponseFormat;
        this.autoHandleResponse = autoHandleResponse;
        this.subscriptionPath= subscriptionPath;
        this.restEnabled = restEnabled;
    }
}

module.exports = RestApi;