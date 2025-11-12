// Configuration class for MongoDB operations and query behavior
class BaseConfigMongo {
    /**
     * Creates MongoDB configuration for CRUD operations
     * @param {Object} config - Configuration options for MongoDB operations
     */
    constructor({
        findExact = [],        // Fields that require exact match in queries
        searchFields = [],     // Fields to search with partial text matching
        defaultMatch = {},     // Default filters applied to all queries
        softDeleteKey = "isDeleted",  // Key used for soft delete operations
        mapping = {},          // Field name mappings for queries
        uniqueKeys = [],       // Fields that must have unique values
        lookups = [],          // MongoDB lookup configurations for joins
        defaultSortDirection = 1,      // Default sort direction (1=asc, -1=desc)
        defaultSortKey = '_id',        // Default field to sort by
        locationKey            // Field name for geolocation queries
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