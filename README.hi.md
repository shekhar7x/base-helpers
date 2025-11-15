[Node.js](http://nodejs.org) के लिए तेज़, निष्पक्ष, न्यूनतम वेब फ्रेमवर्क।

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]

```js
const CrudContollerExpress = require('@s7x/base-helpers');
```

## इंस्टॉलेशन

यह एक [Node.js](https://nodejs.org/en/) मॉड्यूल है जो [npm रजिस्ट्री](https://www.npmjs.com/) के माध्यम से उपलब्ध है।

इंस्टॉल करने से पहले, [Node.js डाउनलोड और इंस्टॉल करें](https://nodejs.org/en/download/)।
Node.js 0.10 या उससे ऊंचा संस्करण आवश्यक है।

इंस्टॉलेशन [`npm install` कमांड](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) का उपयोग करके किया जाता है:

```bash
$ npm install @s7x/base-helpers
```

अधिक जानकारी के लिए [हमारे इंस्टॉलेशन गाइड](http://expressjs.com/en/starter/installing.html) का पालन करें।

## विशेषताएं

- आपके कंट्रोलर्स और मॉडल्स से एक वैध OpenAPI (पूर्व में Swagger) स्पेक (2.0 या 3.0 यदि आप चुनते हैं 😍) जेनरेट होता है, जिसमें शामिल है:
  - पाथ (जैसे GET /users)
  - joi schemas पर आधारित डेफिनिशन्स
  - Parameters/model properties जो joi schemas के आधार पर आवश्यक या वैकल्पिक के रूप में चिह्नित हैं (जैसे joi.required() string OpenAPI स्पेक में आवश्यक है)
  - ऑब्जेक्ट विवरण के लिए jsDoc समर्थित (अधिकांश अन्य मेटाडेटा joi प्रकारों से अनुमानित किया जा सकता है)
- चुनी गई middleware के लिए Routes जेनरेट होते हैं
  - Express, Hapi, और Koa वर्तमान में समर्थित हैं, अन्य middleware को एक सरल handlebars template का उपयोग करके समर्थित किया जा सकता है
  - Request payloads को validate करें
- माइक्रो सर्विसेज के बीच संचार
  - NATS.io का उपयोग bidirectional requests के लिए किया जाता है।
  - KAFKA को unidirectional message streaming के लिए समर्थन प्रदान करता है
- MongoDB के साथ automatic crud api generation के लिए समर्थन

## कार्यान्वयन

### डेटाबेस मॉडल बनाएं

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

### मॉड्यूल बनाएं

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

### Controller जोड़ें

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

### API definitions जोड़ें

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