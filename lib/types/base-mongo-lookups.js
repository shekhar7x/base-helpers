// Configuration class for MongoDB $lookup aggregation operations
class MongoLookup {
    constructor({
        name,           // Identifier for this lookup
        as,             // Output array field name
        from,           // Collection to join
        localField,     // Field from input documents
        foreignField,   // Field from the documents of the "from" collection
        multi = true,   // Whether to return multiple matches
        allowNull = true,  // Whether to allow null/missing values
        let:variables,  // Variables for use in the pipeline
        pipeline        // Custom aggregation pipeline
    }) {
        this.as = as || this.name + 'Data';
        this.name = name;
        this.from = from;
        this.localField = localField;
        this.foreignField = foreignField;
        this.multi = multi;
        this.allowNull = allowNull;
        this.let = variables;
        this.pipeline = pipeline;
    }
}

module.exports = MongoLookup;