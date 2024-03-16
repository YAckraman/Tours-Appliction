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
tourRouter
  .route('/plan/:year')
  .get(protect, authorizeTo('admin', 'lead-guide', 'guide'), planPerYear);
tourRouter.route('/top-5-tours').get(getBest5Tours, getAllTours);
tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, authorizeTo('admin', 'lead-guide'), addTour);
tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(protect, authorizeTo('admin', 'lead-guide'), updateTour)
  .delete(protect, authorizeTo('admin', 'lead-guide'), deleteTour);

module.exports = tourRouter;
