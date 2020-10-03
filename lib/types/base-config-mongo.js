class BaseConfigMongo {
    /**
     * 
     * @param {*} config 
     */
    constructor({
        findExact = [],
        searchFields = [],
        defaultMatch = {},
        softDeleteKey = "isDeleted",
        mapping = {},
        uniqueKeys = [],
        lookups = [],
        defaultSortDirection = 1,
        defaultSortKey = '_id',
        locationKey
    }) {
        this.findExact = findExact;
        this.searchFields = searchFields;
        this.defaultMatch = defaultMatch;
        this.softDeleteKey = softDeleteKey;
        this.mapping = mapping;
        this.uniqueKeys = uniqueKeys;
        this.lookups = lookups;
        this.defaultSortDirection = defaultSortDirection;
        this.defaultSortKey = defaultSortKey;
        this.locationKey = locationKey;
    }
}

module.exports = BaseConfigMongo;