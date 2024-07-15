const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const checkAsync = require('../utils/chechAsync');
const Users = require('./../models/userModel');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/mail');
const tokenCreate = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const sendToken = function (user, statusCode, res) {
  //create a token for the user
  const token = tokenCreate(user._id);
  //specify cookies options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  //if in deployment
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  //add the token to the cookies
  res.cookie('jwt', token, cookieOptions);
  //delete password from  the data
  user.password = undefined;
  //create the response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = checkAsync(async (req, res, next) => {
  const newUser = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    //...(req.body.changedAt && { changedAt: req.body.changedAt }),
    role: req.body.role,
  });
  sendToken(newUser, 201, res);
});
exports.login = checkAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if there is no mail or password

  if (!email || !password) {
    return next(new AppError('please enter email and password'), 400);
  }
  const user = await Users.findOne({ email }).select('+password');
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('email or password is wrong'), 401);
  }
  sendToken(user, 200, res);
});
exports.logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'logout', cookieOptions);
  res.status(200).json({
    status: 'success',
  });
};
exports.protect = checkAsync(async (req, res, next) => {
  let token;
  // console.log(req.cookie.jwt);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return new AppError('you did not login. Please log in to continue', 401);
  }
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user is still exist and not deleted
  const currentUser = await Users.findById(payload.id);
  if (!currentUser) {
    return next(new AppError('user does not exist please login'), 401);
  }
  //check if user changed the password
  if (currentUser.changedPassword(payload.iat)) {
    return next(new AppError('password is changed please login again', 401));
  }
  //pass user to the req Object for the next middleware
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});
exports.isLogged = checkAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      let token = req.cookies.jwt;
      const payload = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
      );

      //check if user is still exist and not deleted
      const currentUser = await Users.findById(payload.id);
      if (!currentUser) {
        return next();
      }
      //check if user changed the password
      if (currentUser.changedPassword(payload.iat)) {
        return next();
      }
      //pass user to the req Object for the next middleware
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});
exports.authorizeTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('you are not authorize to do that action'), 403);
    }
    next();
  };
};
exports.forgetPassword = checkAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) {
    return next(new AppError('there is no user with that email', 404));
  }
  //generate a password token for the user
  const passwordToken = user.createPasswordChangeToken();

  //save the data with .save and that option to not generate validation error
  await user.save({ validateBeforeSave: false });
  //senf the email with the token first the link
  const URL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${passwordToken}`;
  const message = `if you forgot password please do a PATCH request for that link.\n
  ${URL}\n,
  if you did not forgot your password please ignore that message`;
  //pass the options of email to the send email function the email that you will sendto
  //subject and message
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset Token expires in 10 min',
      message,
    });
    //send a a response in case of sucess
    res.status(200).json({
      status: 'success',
      message: 'token send to email',
    });
  } catch (err) {
    //reset the token and the password if error occured
    user.resestPassword = undefined;
    user.expiresAt = undefined;
    //save the data after editing with that option for skipping validate
    user.save({ validateBeforeSave: false });
    //and finally return error with apperror class
    return next(new AppError('no password token sent,please try later', 500));
  }
});
exports.resetPassword = checkAsync(async (req, res, next) => {
  //1)get the password token it is the only way to know the user
  let passtoken = req.params.token;
  //crypt the token to see if it is like resetPassword token in db

  passtoken = crypto.createHash('sha256').update(passtoken).digest('hex');
  console.log(passtoken);
  //find a user with that token and time stamp doesnot exceed current date
  const user = await Users.findOne({
    resestPassword: passtoken,
    expiresAt: { $gt: Date.now() },
  });
  //check if user is not found
  if (!user) {
    return next(
      new AppError('no user found with that token,try again later'),
      500,
    );
  }
  //if user is found upadate the data of that user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //save the data to the collection without options to run validator
  await user.save();
  //after saving login the user with a new token
  sendToken(user, 200, res);
});
exports.updatePassword = checkAsync(async (req, res, next) => {
  //find user in documentation
  const user = await Users.findOne({ email: req.user.email }).select(
    '+password',
  );
  //check if password is the same as that in database
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    //update the password with the new password
    return next(new AppError('wrong password,try again', 401));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  //login the user with the new token and send the token
  sendToken(user, 200, res);
});
