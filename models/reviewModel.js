const mongoose = require('mongoose');
const tours = require('./tourModel');
const User = require('./userModel');
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
reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name photo' }).populate({
  //   path: 'user',
  //   select: 'name duration price',
  // });
  this.populate({ path: 'tour', select: 'name photo' });
  next();
});

const review = mongoose.model('review', reviewSchema);
module.exports = review;
