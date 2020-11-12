  Fast, unopinionated, minimalist web framework for [node](http://nodejs.org).

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

```js
const CrudContollerExpress = require('@s7x/base-helpers');
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install @s7x/base-helpers
```

Follow [our installing guide](http://expressjs.com/en/starter/installing.html)
for more information.

## Features
- A valid OpenAPI (formerly Swagger) spec (2.0 or 3.0 if you choose 😍) is generated from your controllers and models, including:
  - Paths (e.g. GET /users)
  - Definitions based on joi schemas
  - Parameters/model properties marked as required or optional based on joi schemas (e.g. joi.required() string is required in the OpenAPI spec)
  - jsDoc supported for object descriptions (most other metadata can be inferred from joi types)
- Routes are generated for middleware of choice
  - Express, Hapi, and Koa currently supported, other middleware can be supported using a simple handlebars template
  - Validate request payloads
- Inter microservice communication 
  - NATS.io is used for bidirectional requests.
  - Supports KAFKA for unidirectional message streaming
- Support for Automatic crud api generation with Mongodb

## Implementation

### Create database model
```js
const mongoose = require('mongoose');
const schema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Company', schema);
```

### Create module 

config.js
```js
const { MongoLookup, BaseConfigMongo } = require("@s7x/base-helpers/lib/types");

module.exports = new BaseConfigMongo({
    findExact: [ 'name', '_id' ],
    searchFields: ['name', 'description'],
    defaultMatch: { isDeleted: false },
    softDeleteKey: 'isDeleted',
    mapping: {},
    uniqueKeys: ['name'],
    lookups: [
        new MongoLookup({
            name: 'branches',
            from: 'branches',
            as: 'branchesData',
            localField: '_id',
            foreignField: 'branchId',
            multi: true
        }),
    ],
    defaultSortDirection: -1,
    defaultSortKey: 'updatedAt',
});

```
index.js
```js
const { BaseMongo } = require("@s7x/base-helpers/lib/modules");
const config = require("./config");
const  Company = require('../../models/mongo/company');

class Module extends BaseMongo {
    constructor() {
        super(Company, config);
    }
}

module.exports = new Module();

```
### Add Controller

```js
const mainModule = require('../../modules/company');
const CrudContollerExpress = require('@s7x/base-helpers/lib/modules/crud-controller-express');

class Controller extends CrudContollerExpress {
    constructor() {
        super(mainModule);
    }
}

module.exports = new Controller();
```

### Add Api definitions

```js
const controller = require("./controller");
const CrudApi = require("@s7x/base-helpers/lib/modules/crud-api");
const joi = require("joi");

let crudApi = new CrudApi(controller)
let apiPath = 'companies';
let schema = {
    name: joi.string().required(),
    description: joi.string().allow('').optional(),
};
let routes = [
    crudApi.getCreateApi(schema),
    crudApi.getFindAllApi({
        ...validation.paginator
    }),
    crudApi.getFindByIdApi(),
    crudApi.getUpdateByIdApi(schema),
    crudApi.getreplaceByIdApi(schema),
    crudApi.getDeleteByIdApi({}, true)
]

module.exports = { basePath: `/${apiPath}`, routes }

```


[npm-image]: https://img.shields.io/npm/v/@s7x/base-helpers
[npm-url]: https://npmjs.org/package/@s7x/base-helpers
[downloads-image]: https://img.shields.io/npm/dm/@s7x/base-helpers.svg
[downloads-url]: https://npmjs.org/package/@s7x/base-helpers
[travis-image]: https://img.shields.io/travis/expressjs/express/master.svg?label=linux
[travis-url]: https://travis-ci.org/expressjs/express
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/express/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/express
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/express?branch=master