const AppError = require('./utils/AppError');

const castErrorHandler = function (err) {
  console.log(1);
  const message = `Invalid value ${err.value} for ${err.path}`;
  return new AppError(message, 400);
};
const duplicateErrorHandler = function (err) {
  const val = err.keyValue;
  const message = `Duplicate field value "${Object.values(val)}", please enter another value `;
  //console.log(val);
  return new AppError(message, 400);
};
const validationErrorHandler = function (err) {
  const errors = err.errors;
  const message = Object.values(errors)
    .map((er) => er.message)
    .join(' .');
  return new AppError(message, 400);
};
const devErrorHandler = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const validationJWTHandler = () =>
  new AppError('Token is not valid signin again', 401);

const validationExpiredToken = () =>
  new AppError('Token have expired!, login again', 401);
const prodErrorHandler = function (err, res) {
  // console.log(err.name, err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'fail',
      message: 'something went wrong',
      error: err,
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devErrorHandler(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    console.log(error.name);
    if (err.name === 'CastError') error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateErrorHandler(error);
    if (err.name === 'ValidationError') error = validationErrorHandler(error);
    if (error.name === 'JsonWebTokenError') error = validationJWTHandler();
    if (error.name === 'TokenExpiredError') error = validationExpiredToken();
    prodErrorHandler(error, res);
  }
};
