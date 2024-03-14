const AppError = require('../utils/AppError');
const Tours = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const checkAsync = require('./../utils/chechAsync');
//CONTROLE THE TOP-5-TOURS REQOBJECT

exports.getBest5Tours = (req, res, next) => {
  req.query.sort = '-ratingAverage,price';
  req.query.limit = 5;
  req.query.fields = 'name,price,ratingAverage,price,description,summary';
  next();
};

exports.getStats = checkAsync(async (req, res, next) => {
  const statics = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        toursNum: { $sum: 1 },
        ratingNum: { $sum: '$ratingsQuantity' },
        ratingeAvg: { $avg: '$ratingsAverage' },
        priceAvg: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { priceAvg: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    results: statics.length,
    data: {
      statics,
    },
  });
});
exports.planPerYear = checkAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: { $gt: new Date(`${year}-01-01`) },
        startDates: { $lt: new Date(`${year}-12-31`) },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        name: { $push: '$name' },
        toursNumber: { $sum: 1 },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { toursNumber: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
// Parse JSON bodies
exports.getAllTours = checkAsync(async (req, res, next) => {
  let features = new apiFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .filterFields()
    .pagination();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
exports.getTourById = checkAsync(async (req, res, next) => {
  const tour = await Tours.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError(`no tour with that id`, 400));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.addTour = checkAsync(async (req, res, next) => {
  const newTour = await Tours.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});
exports.updateTour = checkAsync(async (req, res, next) => {
  const tour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError(`no tour with that id`, 400));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.deleteTour = checkAsync(async (req, res, next) => {
  const tour = await Tours.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`no tour with that id`, 400));
  }
  res.status(204).json({
    status: 'success',
    data: 'null',
  });
});
