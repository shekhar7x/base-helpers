class MongoLookup {
    constructor({
        name,
        as,
        from,
        localField,
        foreignField,
        multi = true,
        allowNull = true,
        let,
        pipeline
    }) {
        this.as = as || this.name + 'Data';
        this.name = name;
        this.from = from;
        this.localField = localField;
        this.foreignField = foreignField;
        this.multi = multi;
        this.allowNull = allowNull;
        this.let = let;
        this.pipeline = pipeline;
    }
}

module.exports = MongoLookup;