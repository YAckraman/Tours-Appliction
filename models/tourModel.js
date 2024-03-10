const mongoose = require('mongoose');
const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is reuired'],
      unique: true,
      minlength: [10, 'name must be at least 10 character'],
      maxlength: [20, 'name must not exceed 15 characters'],
    },
    price: {
      type: Number,
      required: [true, 'there is no price'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
      enum: {
        values: ['easy', 'meduim', 'difficult'],
        message: 'value must be easy , meduim or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be at least 1'],
      max: [5, 'rating must be at max 5 '],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
tourschema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(3);
});
tourschema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourschema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tours = mongoose.model('Tour', tourschema);
module.exports = Tours;
