const mongoose = require('mongoose');
const tours = require('./tourModel');
const User = require('./userModel');
const Tours = require('./tourModel');
const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: [1, 'min rating is not less than 1'],
      max: [5, 'max rating is not greater than 5'],
    },
    review: {
      type: String,
      required: [true, 'review shall not be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'a review must have a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      required: [true, 'a review must have a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name duration' }).populate({
    path: 'user',
    select: 'name image',
  });
  // this.populate({ path: 'tour', select: 'name duration price' });
  next();
});
reviewSchema.statics.updateReviewStats = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  //console.log(stats);
  await Tours.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].ratingsAverage,
    ratingsQuantity: stats[0].ratingsQuantity,
  });
};
reviewSchema.post('save', function () {
  this.constructor.updateReviewStats(this.tour);
});
//to get the current document that being updated or deleted
//findOneAnd is used by findByIdAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //to get the current document we will search for it before it is updated
  //store it in the schema
  this.curr = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //to upate the tour after the review is updated
  //to reach the static function on the model which updateReviewStats, we access
  //it from the current review from last middleware

  await this.curr.constructor.updateReviewStats(this.curr.tour._id);
});

const review = mongoose.model('review', reviewSchema);
module.exports = review;
