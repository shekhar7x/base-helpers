
const { mongoUtils } = require("../utils");
class BaseMongo {
    constructor(Model, config) {
        this.Model = Model;
        this.findExact = config.findExact || [];
        this.searchFields = config.searchFields || [];
        this.defaultMatch = config.defaultMach || [];
        this.softDeleteKey = config.defaultMach || "isDeleted";
        this.mapping = config.mapping || {};
        this.uniqueKeys = config.uniqueKeys || [];
        this.lookups = config.lookups || [];
        this.sortCondition = config.sortCondition || { _id: 1 };
        this.modelName = this.Model.modelName || "Resource";
    }

    async create(data) {
        await mongoUtils.checkDuplicateEntries(this.Model, undefined, data, this.uniqueKeys);
        let doc = new this.Model(data);
        await doc.save();
        return doc;
    }
    async findById(id) {
        let doc = await this.Model.findById(id);
        return doc;
    }
    async findOne(filter, projection, options) {
        let doc = await this.Model.findOne(filter, projection, options);
        return doc;
    }
    async findAll(filter, projection, options) {
        let docs = await this.Model.find(filter, projection, options);
        return docs;
    }
    async aggregateById(id) {
        let query = [
            ...mongoUtils.aggregateMatch({ _id: id }, ["_id"]),
            ...mongoUtils.lookup(this.lookups)
        ];
        let doc = (await this.Model.aggregate(query))[0];
        await this.throwIfNotFound(doc);
        return doc;
    }

    async aggregateAll(filter) {
        let defaultResult = { items: [], totalCount: 0 };
        let query = [
            ...mongoUtils.aggregateMatch(filter, this.findExact, this.searchFields, this.mapping, this.defaultMatch),
            ...mongoUtils.lookup(this.lookups),
            ...mongoUtils.paginateWithTotalCount(this.sortCondition, payload.index, payload.limit),
        ];
        let docs = (await this.Model.aggregate(query))[0] || defaultResult;
        return docs;
    }
    async modifyById(id, dataToUpdate) {
        let doc = this.findById(id);
        Object.assign(doc, dataToUpdate);
        await doc.save();
        return doc;
    }
    async updateById(id, dataToUpdate) {
        let doc = await this.Model.findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true });
        await this.throwIfNotFound(doc);
        return doc;
    }
    async replaceById(id, dataToUpdate) {
        let doc = await this.Model.findOneAndReplace({ _id: id }, dataToUpdate)
        return doc;
    }
    async deleteById(id, options = { hardDelete: true }) {
        let doc = await this.Model.findById(id);
        await this.throwIfNotFound(doc);
        if (options.hardDelete === true) {
            await doc.remove()
        } else {
            doc[this.softDeleteKey] = true;
            await doc.save();
        }
        return doc;
    }
    async throwIfNotFound(doc) {
        if (!doc) {
            throw Object.assign(
                new Error(`${Resource} doesn't exist!`),
                { statusCode: 404 }
            );
        }
    }
}

module.exports = BaseMongo;