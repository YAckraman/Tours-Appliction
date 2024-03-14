const express = require('express');
const tourRouter = express.Router();
const {
  getAllTours,
  addTour,
  getTourById,
  updateTour,
  deleteTour,
  getBest5Tours,
  getStats,
  planPerYear,
} = require('../controllers/tourController');
const { protect, authorizeTo } = require('../controllers/authController');
const reviewRoute = require('./reviewRoute');

// tourRouter.param('id', checkId);
tourRouter.use('/:tourId/reviews', reviewRoute);
tourRouter.route('/tours-stats').get(getStats);
tourRouter.route('/plan/:year').get(planPerYear);
tourRouter.route('/top-5-tours').get(getBest5Tours, getAllTours);
tourRouter
  .route('/')
  .get(protect, authorizeTo('admin', 'lead-guide'), getAllTours)
  .post(addTour);
tourRouter.route('/:id').get(getTourById).patch(updateTour).delete(deleteTour);
module.exports = tourRouter;
