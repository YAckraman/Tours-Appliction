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
