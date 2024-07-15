const express = require('express');
const {
  getOverview,
  getTours,
  loginView,
  getUserAccount,
  updateNameAndEmail,
} = require('../controllers/viewController');
const { protect, isLogged } = require('../controllers/authController');

const viewRoute = express.Router();

//request for overview page

viewRoute.get('/', isLogged, getOverview);
//get the view of tours
viewRoute.get('/tour/:slug', protect, getTours);
viewRoute.get('/login', isLogged, loginView);
viewRoute.get('/me', protect, getUserAccount);
viewRoute.post('/submit-user-data', protect, updateNameAndEmail);
module.exports = viewRoute;
