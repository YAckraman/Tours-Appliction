const express = require('express');
const reviewController = require('./../controllers/reviewController');
const { protect, authorizeTo } = require('../controllers/authController');
const reviewRoute = express.Router({ mergeParams: true });

reviewRoute
  .route('/')
  .get(reviewController.getAllReview)
  .post(protect, authorizeTo('user'), reviewController.addNewReview);
module.exports = reviewRoute;
