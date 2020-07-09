class MongoLookup {
    constructor({
        name,
        as,
        from,
        localField,
        foreignField,
        multi = true,
        allowNull = true
    }) {
        this.as = as || this.name + 'Data';
        this.name = name;
        this.from = from;
        this.localField = localField;
        this.foreignField = foreignField;
        this.multi = multi;
        this.allowNull = allowNull;
    }
}

module.exports = MongoLookup;