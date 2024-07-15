const AppError = require('./utils/AppError');
const express = require('express');
const app = express();

const castErrorHandler = function (err) {
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
const devErrorHandler = function (err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message,
  });
};
const validationJWTHandler = () =>
  new AppError('Token is not valid signin again', 401);

const validationExpiredToken = () =>
  new AppError('Token have expired!, login again', 401);
const prodErrorHandler = function (err, req, res) {
  // console.log(err.name, err.isOperational);
  if (req.originalUrl.startsWith('/api')) {
    err.isOperational
      ? res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
        })
      : res.status(500).json({
          status: 'fail',
          message: 'something went wrong',
          error: err,
        });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
  return res.status(500).render('error', {
    title: 'something went wrong',
    msg: 'please try again',
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    devErrorHandler(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log(error.name);
    if (err.name === 'CastError') error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateErrorHandler(error);
    if (err.name === 'ValidationError') error = validationErrorHandler(error);
    if (error.name === 'JsonWebTokenError') error = validationJWTHandler();
    if (error.name === 'TokenExpiredError') error = validationExpiredToken();
    prodErrorHandler(error, req, res);
  }
};
