class BaseConfigMongo {
    constructor() {
        this.findExact = [];
        this.searchFields = [];
        this.defaultMach = [];
        this.softDeleteKey = "isDeleted";
        this.mapping = {};
        this.uniqueKeys = [];
        this.lookups = [];
        this.defaultSortDirection = 1;
        this.defaultSortKey = '_id';
        this.locationKey = '';
    }
}

module.exports = BaseConfigMongo;