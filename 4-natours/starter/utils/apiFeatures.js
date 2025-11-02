class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        console.log('filter function called successfully');
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        let appendedObject = JSON.stringify(queryObj);
        appendedObject = appendedObject.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(appendedObject));
        return this;
        // const query =  Tour.find(
        //     JSON.parse(appendedObject)
        // );
    }

    sort(){
        console.log('sort function called successfully');
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        return this;
    }

    limitFields(){
        console.log('limitFields function called successfully');
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query.select(fields);
        }
        return this;
    }
    paginate(){
        console.log('paginate function called successfully');
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;