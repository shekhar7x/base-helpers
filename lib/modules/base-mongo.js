
const { mongoUtils } = require("../utils");
class BaseMongo {
    constructor(Model, config) {
        this.Model = Model;
        this.findExact = config.findExact || [];
        this.searchFields = config.searchFields || [];
        this.defaultMatch = config.defaultMatch || {};
        this.softDeleteKey = config.softDeleteKey || "isDeleted";
        this.mapping = config.mapping || {};
        this.uniqueKeys = config.uniqueKeys || [];
        this.lookups = config.lookups || [];
        this.defaultSortDirection = config.defaultSortDirection || 1;
        this.defaultSortKey = config.defaultSortKey || '_id';
        this.modelName = this.Model.modelName || "Resource";
        this.locationKey = config.locationKey;
        this.includeEnums = this.lookups.map(lookup => lookup.name);
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
    async aggregateById(id, filter = {}) {
        let query = [
            ...mongoUtils.aggregateMatch({ _id: id }, ["_id"]),
            ...mongoUtils.lookup(this.lookups, filter.include)
        ];
        let doc = (await this.Model.aggregate(query))[0];
        await this.throwIfNotFound(doc);
        return doc;
    }

    async aggregateAll(filter = {index:0, limit: 99999}) {
        let sortCondition = mongoUtils.getSortCondition(filter, this.defaultSortKey, this.defaultSortDirection);
        let defaultResult = { items: [], totalCount: 0 };
        let query = [
            ...mongoUtils.aggregateMatch(filter, this.findExact, this.searchFields, this.mapping, this.defaultMatch),
            ...mongoUtils.lookup(this.lookups, filter.include),
            ...mongoUtils.paginateWithTotalCount(sortCondition, filter.index, filter.limit),
        ];
        let docs = (await this.Model.aggregate(query))[0] || defaultResult;
        return docs;
    }

    async aggregateWithGeoLocation(filter) {
        let defaultResult = { items: [], totalCount: 0 };
        let sortCondition = mongoUtils.getSortCondition(filter, 'distance', 1);
        let { distanceInMeters, locationCoordinates } = filter;
        let matchStage = mongoUtils.aggregateMatch(filter, this.findExact, this.searchFields, this.mapping, this.defaultMatch)[0];
        let matchQuery = matchStage && matchStage.$match;
        let query = [
            ...mongoUtils.getGeoNearStage(locationCoordinates, distanceInMeters, matchQuery, this.locationKey),
            ...mongoUtils.lookup(this.lookups, filter.include),
            ...mongoUtils.paginateWithTotalCount(sortCondition, filter.index, filter.limit)
        ]
        let docs = (await this.Model.aggregate(query))[0] || defaultResult;
        return docs
    }

    async modifyById(id, dataToUpdate) {
        let doc = this.findById(id);
        Object.assign(doc, dataToUpdate);
        await doc.save();
        return doc;
    }
    async updateById(id, dataToUpdate) {
        let doc = await this.Model.findByIdAndUpdate(id, dataToUpdate, { new: true });
        await this.throwIfNotFound(doc);
        return doc;
    }

    async patchById(id, dataToUpdate) {
        let doc = await this.Model.findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true });
        await this.throwIfNotFound(doc);
        return doc;
    }
    async replaceById(id, dataToUpdate) {
        let doc = await this.Model.findOneAndReplace({ _id: id }, dataToUpdate, { new: true });
        await this.throwIfNotFound(doc);
        return doc;
    }
    async deleteById(id, options = { hardDelete: true }) {
        let doc = await this.Model.findById(id);
        await this.throwIfNotFound(doc);
        doc[this.softDeleteKey] = true;
        if (options.hardDelete === true) {
            await doc.remove()
        } else {
            await doc.save();
        }
        return doc;
    }


    // http error methods
    async throwError(message, statusCode) {
        throw Object.assign(
            new Error(message || 'Something went wrong!'),
            { statusCode: statusCode || 500 }
        );
    }
    async throwIfNotFound(doc, message) {
        if (!doc) {
            message = message || `${this.modelName} doesn't exist!`;
            await this.throwError(message, 404);
        }
    }

    async throwValidationError(message = 'Invalid request payload!') {
        await this.throwError(message, 400);
    }
}

module.exports = BaseMongo;