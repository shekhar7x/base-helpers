## @s7x/base-helpers

`@s7x/base-helpers` एक तेज़, हल्का और लचीला Node.js हेल्पर पैकेज है जो CRUD मॉड्यूल, वैलिडेशन और ऑटोमेटेड OpenAPI डॉक्यूमेंटेशन बनाने में मदद करता है। यह माइक्रोसर्विस कम्युनिकेशन और MongoDB आधारित CRUD ऑपरेशन्स को सरल बनाता है।

### विशेषताएँ
- **OpenAPI स्पेक जनरेशन**: Controller और Model से स्वतः Swagger (2.0 / 3.0) स्पेक तैयार करता है।
- **लचीले रूट्स**: Express, Hapi और Koa जैसे फ्रेमवर्क के लिए रूट्स का निर्माण।
- **रिक्वेस्ट वैलिडेशन**: Joi स्कीमा का उपयोग कर रिक्वेस्ट डेटा को वैलिडेट करता है।
- **माइक्रोसर्विस कम्युनिकेशन**: NATS.io द्वारा द्वि-दिशीय कम्युनिकेशन और Kafka द्वारा स्ट्रीमिंग।
- **MongoDB CRUD सपोर्ट**: बेसिक CRUD ऑपरेशन्स को साधारण कॉन्फिगरेशन के साथ सेटअप करता है।

### इंस्टॉलेशन
Node.js 16 या उससे ऊपर का वर्शन अनुशंसित है।

```bash
npm install @s7x/base-helpers
```

### उपयोग उदाहरण
`BaseMongo` मॉड्यूल के साथ कंपनी CRUD API सेटअप करने का उदाहरण:

```js
const { BaseMongo } = require("@s7x/base-helpers/lib/modules");
const config = require("./config");
const Company = require("../../models/mongo/company");

class Module extends BaseMongo {
  constructor() {
    super(Company, config);
  }
}

module.exports = new Module();
```

### OpenAPI रूट कॉन्फिगरेशन

```js
const controller = require("./controller");
const CrudApi = require("@s7x/base-helpers/lib/modules/crud-api");
const joi = require("joi");

const crudApi = new CrudApi(controller);
const apiPath = "companies";
const schema = {
  name: joi.string().required(),
  description: joi.string().allow("").optional(),
};

module.exports = {
  basePath: `/${apiPath}`,
  routes: [
    crudApi.getCreateApi(schema),
    crudApi.getFindAllApi({ /* paginator */ }),
    crudApi.getFindByIdApi(),
    crudApi.getUpdateByIdApi(schema),
    crudApi.getreplaceByIdApi(schema),
    crudApi.getDeleteByIdApi({}, true),
  ],
};
```

### अतिरिक्त संसाधन
- दस्तावेज़: `lib/` डायरेक्टरी में उपलब्ध मॉड्यूल और टाइप्स देखें।
- प्रश्न या सुझाव के लिए GitHub Issues खोलें।

---

**लेखक:** S7X टीम
