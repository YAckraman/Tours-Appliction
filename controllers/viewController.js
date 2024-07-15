const Tours = require('../models/tourModel');
const Users = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/chechAsync');
exports.getOverview = catchAsync(async (req, res, next) => {
  //1)get the tour data
  const tours = await Tours.find();

  //2)render all data

  //3)send the tours to view
  res.status(200).render('overview', {
    title: 'this is overview',
    tours,
  });
});
exports.getTours = catchAsync(async (req, res, next) => {
  //get the desired tour
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //2)build the template
  //3)return the desired tour with data
  if (!tour) {
    return next(new AppError('there is no tour with such a name', 401));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
    )
    .render('tours', {
      title: `${tour.name} Tour`,
      tour,
    });
});
exports.loginView = (req, res) => {
  res.status(200).render('login', {
    title: 'log in to your account',
  });
};
exports.getUserAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};
exports.updateNameAndEmail = catchAsync(async (req, res, next) => {
  const updatedUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'your account',
    user: updatedUser,
  });
});
