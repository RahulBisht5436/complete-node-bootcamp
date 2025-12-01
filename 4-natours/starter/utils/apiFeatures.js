// ------------------------------------------------------------
// APIFeatures Class
// Provides filtering, sorting, field limiting, and pagination
// for Mongoose queries using URL query parameters
// ------------------------------------------------------------
class APIFeatures {

    // The constructor receives:
    // 1) query → Mongoose query object (e.g., Tour.find())
    // 2) queryString → req.query (raw user query parameters)
    constructor(query, queryString) {
        this.query = query;               // Mongoose query
        this.queryString = queryString;   // URL query parameters
    }


    // --------------------------------------------------------
    // FILTERING
    // Removes special params like page, sort, limit, fields
    // Then converts comparison operators (gte/gt/lte/lt)
    // into MongoDB form ($gte / $gt / $lte / $lt)
    // --------------------------------------------------------
    filter() {
        console.log('filter function called successfully');

        // Create a shallow copy of queryString
        const queryObj = { ...this.queryString };

        // Fields to exclude from filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Convert object to JSON string to replace operators
        let appendedObject = JSON.stringify(queryObj);

        // Replace gte, gt, lte, lt → $gte, $gt, $lte, $lt
        appendedObject = appendedObject.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        );

        // Apply the filter to Mongoose query
        this.query = this.query.find(JSON.parse(appendedObject));

        // Allow chaining
        return this;
    }


    // --------------------------------------------------------
    // SORTING
    // ?sort=price,ratingsAverage  → 'price ratingsAverage'
    // Default: no sorting applied
    // --------------------------------------------------------
    sort() {
        console.log('sort function called successfully');

        if (this.queryString.sort) {
            // Convert comma-separated fields into space-separated string
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }

        return this;
    }


    // --------------------------------------------------------
    // FIELD LIMITING (Projection)
    // ?fields=name,price → Only return those fields
    // Default: return all fields
    // --------------------------------------------------------
    limitFields() {
        console.log('limitFields function called successfully');

        if (this.queryString.fields) {
            // Convert CSV fields to space-separated string
            const fields = this.queryString.fields.split(',').join(' ');
            this.query.select(fields);
        }

        return this;
    }


    // --------------------------------------------------------
    // PAGINATION
    // page=2&limit=10 → skip = 10, limit = 10
    // Default: page=1, limit=100
    // --------------------------------------------------------
    paginate() {
        console.log('paginate function called successfully');

        // Convert strings to numbers using *1
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        // Apply pagination to Mongoose query
        this.query.skip(skip).limit(limit);

        return this;
    }
}


// Export class for use in controllers
module.exports = APIFeatures;
