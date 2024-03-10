class apiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    let paramsObj = { ...this.queryString };

    const except = ['page', 'limit', 'sort', 'fields'];
    except.forEach((element) => {
      delete paramsObj[element];
    });
    let queryObj = JSON.stringify(paramsObj);
    queryObj = queryObj.replace(/\b(gt|gte|lt|lte)\b/, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryObj));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  filterFields() {
    if (this.queryString.fields) {
      const selectBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(selectBy);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = apiFeatures;
