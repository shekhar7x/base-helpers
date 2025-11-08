# @s7x/base-helpers

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Node.js helpers for rapid CRUD API development with MongoDB.

## Installation

```bash
npm install @s7x/base-helpers
```

## Features

- Auto-generated CRUD APIs with MongoDB
- OpenAPI/Swagger spec generation from Joi schemas
- Express, Hapi, and Koa support
- Request validation
- Microservice communication (NATS.io, Kafka)

## Quick Start

**1. Model**
```js
const mongoose = require('mongoose');
module.exports = mongoose.model('Company', new mongoose.Schema({
    name: String,
    description: String,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true }));
```

**2. Module**
```js
const { BaseMongo, BaseConfigMongo } = require("@s7x/base-helpers");
const Company = require('./models/company');

const config = new BaseConfigMongo({
    searchFields: ['name', 'description'],
    defaultMatch: { isDeleted: false }
});

module.exports = new BaseMongo(Company, config);
```

**3. Controller**
```js
const CrudControllerExpress = require('@s7x/base-helpers/lib/modules/crud-controller-express');
const companyModule = require('./modules/company');

module.exports = new CrudControllerExpress(companyModule);
```

**4. Routes**
```js
const CrudApi = require("@s7x/base-helpers/lib/modules/crud-api");
const controller = require("./controller");
const joi = require("joi");

const crudApi = new CrudApi(controller);
const schema = { name: joi.string().required() };

module.exports = {
    basePath: '/companies',
    routes: [
        crudApi.getCreateApi(schema),
        crudApi.getFindAllApi(),
        crudApi.getFindByIdApi(),
        crudApi.getUpdateByIdApi(schema),
        crudApi.getDeleteByIdApi()
    ]
};
```

[npm-image]: https://img.shields.io/npm/v/@s7x/base-helpers
[npm-url]: https://npmjs.org/package/@s7x/base-helpers
[downloads-image]: https://img.shields.io/npm/dm/@s7x/base-helpers.svg
[downloads-url]: https://npmjs.org/package/@s7x/base-helpers