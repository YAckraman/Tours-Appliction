const mongoose = require('mongoose');
const Users = require('./userModel');
const slugify = require('slugify');
const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is reuired'],
      unique: true,
      minlength: [10, 'name must be at least 10 character'],
      maxlength: [20, 'name must not exceed 15 characters'],
    },
    slug: {
      type: String,
      default: function () {
        return slugify(this.name, {
          replacement: '-',
          locale: 'en',
          lower: true,
        });
      },
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
        values: ['easy', 'medium', 'difficult'],
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
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        description: String,
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
      },
    ],
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
tourschema.index({ slug: 1 });
tourschema.index({ price: 1, ratingsAverage: -1 });
tourschema.index({ startLocation: '2dsphere' });
tourschema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(3);
});
tourschema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id',
});
tourschema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -changedAt' });
  next();
});
tourschema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
// tourschema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
const Tours = mongoose.model('Tour', tourschema);
module.exports = Tours;
