const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routers/tourRoute');
const usersRouter = require('./routers/usersRoute');
const AppError = require('./utils/AppError');
const ErrorController = require('./errorController');
const reviewRoute = require('./routers/reviewRoute');
const app = express();

const limiter = rateLimit({
  max: 100, //max request by a user
  windowMS: 60 * 60 * 1000, //the time stamp the user shall wait till he make other one
  message: 'to many request of that IP,please try again after an hour', //error message
});
app.use('/api', limiter);
//put security headers

app.use(helmet());
//add data sanitizing package that will delete $ in data fields
app.use(expressSanitize());

//to prevent to put any malicious code in the fields of logins like html code
//or javascript or any code
app.use(xss());

//to clear in the params or request from repeated fields that will cause an error
//like sort
app.use(
  hpp({
    whitelist: [
      'price',
      'ratingsAverage',
      'difficulty',
      'duration',
      'maxGroupSize',
      'ratingsQuantity',
    ],
  }),
);
app.use(express.json({ limit: '300kb' }));
app.use(express.static(`${__dirname}/public`));
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/review', reviewRoute);
app.all('*', (req, res, next) => {
  //   const err = new Error(`that url ${req.originalUrl} is not on the server`);
  //   err.status = 'fail';
  //   err.statusCode = 404;
  next(new AppError(`that url ${req.originalUrl} is not on the server`), 400);
});
app.use(ErrorController);
module.exports = app;
