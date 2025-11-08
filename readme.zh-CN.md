  快速、灵活、极简的 [Node.js](http://nodejs.org) Web 框架。

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

```js
const CrudContollerExpress = require('@s7x/base-helpers');
```

## 安装

这是一个通过 [npm 注册表](https://www.npmjs.com/) 提供的 [Node.js](https://nodejs.org/en/) 模块。

在安装之前，请先[下载并安装 Node.js](https://nodejs.org/en/download/)。
需要 Node.js 0.10 或更高版本。

使用 [`npm install` 命令](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)进行安装：

```bash
$ npm install @s7x/base-helpers
```

更多信息请参考[安装指南](http://expressjs.com/en/starter/installing.html)。

## 特性
- 从控制器和模型自动生成有效的 OpenAPI（原 Swagger）规范（支持 2.0 或 3.0 😍），包括：
  - 路径（例如 GET /users）
  - 基于 joi 模式的定义
  - 根据 joi 模式标记为必需或可选的参数/模型属性（例如 joi.required() 字符串在 OpenAPI 规范中为必需）
  - 支持 jsDoc 用于对象描述（大多数其他元数据可以从 joi 类型推断）
- 为所选中间件生成路由
  - 目前支持 Express、Hapi 和 Koa，其他中间件可以使用简单的 handlebars 模板支持
  - 验证请求负载
- 微服务间通信
  - 使用 NATS.io 进行双向请求
  - 支持 KAFKA 进行单向消息流
- 支持使用 MongoDB 自动生成 CRUD API

## 实现

### 创建数据库模型
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

### 创建模块

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
### 添加控制器

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

### 添加 API 定义

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
