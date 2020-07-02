let BaseMongo = require('./base-mongo')
let { httpUtils } = require('../utils');

class CrudContollerExpress {
    constructor(module) {
        this.module = new BaseMongo();
    }

    async create(request) {
        let { body: data } = request;
        let resource = this.module.create(data);

    }

    async findAll(request) {
        let { query: filter } = request;
        return this.module.aggregateAll(filter);
    }

    async findById(request) {
        let { query: filter } = request;
        return this.module.aggregateById(filter);
    }

    async updateById(request) {
        let { query: filter } = request;
        return this.module.updateById(filter);
    }

    async replaceById(request) {
        let { query: filter } = request;
        return this.module.replaceById(filter);
    }
    async deleteById(request) {
        let { query: filter } = request;
        return this.module.aggregateAll(filter);
    }
}

module.exports = CrudContollerExpress;