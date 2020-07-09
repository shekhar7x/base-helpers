
class CrudContollerExpress {
    constructor(module) {
        this.module = module;
        this.name = module.modelName
    }

    async create(request) {
        let { body: data } = request;
        return this.module.create(data);

    }

    async findAll(request) {
        let { query: filter } = request;
        return this.module.aggregateAll(filter);
    }

    async findById(request) {
        let { params: { id } } = request;
        return this.module.aggregateById(id);
    }

    async updateById(request) {
        let { params: { id }, body: dataToUpdate } = request;
        return this.module.patchById(id, dataToUpdate);
    }

    async replaceById(request) {
        let { params: { id }, body: dataToUpdate } = request;
        return this.module.replaceById(id, dataToUpdate);
    }

    async deleteById(request) {
        let { params: { id }, query: options } = request;
        return this.module.deleteById(id, options);
    }
}

module.exports = CrudContollerExpress;