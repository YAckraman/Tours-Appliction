const AppError = require('../utils/AppError');
const Tours = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const checkAsync = require('./../utils/chechAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getAll,
  getOne,
} = require('./factorController');
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

exports.getTourById = getOne(Tours, { path: 'reviews' });
exports.getAllTours = getAll(Tours);
exports.addTour = createOne(Tours);
exports.updateTour = updateOne(Tours);
exports.deleteTour = deleteOne(Tours);
exports.getToursWithinGeo = checkAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log(distance, latlng, unit);
  const [lat, lng] = latlng.split(',');
  const raduis = unit === 'mi' ? distance / 3963.19 : distance / 6378.13;
  if (!lat || !lng) {
    return next(new AppError('please enter lat,lng in the correct order', 400));
  }
  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], raduis] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.distanceBetweenLocationAndTours = checkAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const multi = unit === 'mi' ? 0.000621371 : 0.001;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('please enter lat,lng in the correct order', 400));
  }
  const distance1 = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multi,
      },
    },
    {
      $project: {
        name: 1,
        duration: 1,
        price: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distance1,
    },
  });
});
