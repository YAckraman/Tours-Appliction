const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const expressSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const viewRoute = require('./routers/viewRoute');
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
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'unsafe-inline'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com'],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      connectSrc: ["'self'", 'data', 'https://*.cloudflare.com'],
    },
  }),
);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'unsafe-inline'],

      scriptSrc: ["'self'", ' https://*.mapbox.com'],

      scriptSrcElem: ["'self'", 'https:', ' https://*.mapbox.com'],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      connectSrc: ["'self'", 'data', ' https://*.mapbox.com'],
    },
  }),
);
//add data sanitizing package that will delete $ in data fields
app.use(expressSanitize());
app.use(cookieParser());
//to prevent to put any malicious code in the fields of logins like html code
//or javascript or any code
app.use(xss());
//set the view engine to pug
app.set('view engine', 'pug');
//set the directory to pug folder
app.set('views', path.join(__dirname, 'views'));

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
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '300kb' }));
app.use(express.static(`${__dirname}/public`));
app.use('/', viewRoute);
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
