const express = require('express');
const reviewController = require('./../controllers/reviewController');
const { protect, authorizeTo } = require('../controllers/authController');
const reviewRoute = express.Router({ mergeParams: true });

reviewRoute.use(protect);
reviewRoute
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authorizeTo('user'),
    reviewController.setTourAndName,
    reviewController.addNewReview,
  );

reviewRoute
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authorizeTo('user', 'admin'), reviewController.updateReview)
  .delete(authorizeTo('user', 'admin'), reviewController.deleteReview);
module.exports = reviewRoute;
