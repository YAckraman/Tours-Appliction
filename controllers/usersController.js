const Users = require('../models/userModel');
const AppError = require('../utils/AppError');
const chechAsync = require('../utils/chechAsync');

const Objectfilter = function (obj, ...fields) {
  const filter = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) filter[el] = obj[el];
  });
  return filter;
};
//function to update the account data except the password
exports.updateAccount = chechAsync(async (req, res, next) => {
  //get the data to be updated and check it is not password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('you cannot update password from here', 400));
  }
  //select only the data to be updated and find the user first
  const filteredObj = Objectfilter(req.body, 'name', 'email');
  //use that find and update instead of save because we will not update sensetive
  //data as pass so that validator will not work and the mongoose middleware
  const user = await Users.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
exports.deleteAccount = chechAsync(async (req, res, next) => {
  const user = await Users.findByIdAndUpdate(req.user.id, { active: false });
  // user.acive = false;
  // await user.save();
  res.json(204).json({
    status: 'success',
    data: null,
  });
});
exports.getAllUsers = chechAsync(async (req, res) => {
  const users = await Users.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});
exports.addUser = (req, res) => {
  res.status(505).json({
    status: 'error',
    message: 'Inernal Server Error',
  });
};
exports.getUserById = (req, res) => {
  res.status(505).json({
    status: 'error',
    message: 'Inernal Server Error',
  });
};
exports.updateUser = (req, res) => {
  res.status(505).json({
    status: 'error',
    message: 'Inernal Server Error',
  });
};
exports.deleteUser = (req, res) => {
  res.status(505).JSON({
    status: 'error',
    message: 'Inernal Server Error',
  });
};
