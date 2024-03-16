const Review = require('./../models/reviewModel');
const checkAsync = require('./../utils/chechAsync');
const {
  updateOne,
  createOne,
  deleteOne,
  getAll,
  getOne,
} = require('./factorController');

exports.setTourAndName = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getReview = getOne(Review);
exports.getAllReview = getAll(Review);
exports.deleteReview = deleteOne(Review);
exports.addNewReview = createOne(Review);
exports.updateReview = updateOne(Review);
