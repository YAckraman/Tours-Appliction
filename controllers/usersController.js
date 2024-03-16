const { update } = require('../models/reviewModel');
const Users = require('../models/userModel');
const AppError = require('../utils/AppError');
const chechAsync = require('../utils/chechAsync');
const { deleteOne, updateOne, getAll, getOne } = require('./factorController');

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
exports.getCurrentUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getMe = getOne(Users);
exports.addUser = (req, res) => {
  res.status(505).json({
    status: 'error',
    message: 'not valid path,please use /sign up',
  });
};
exports.getUserById = getOne(Users);
exports.getAllUsers = getAll(Users);
//do not use for password change
exports.updateUser = updateOne(Users);
exports.deleteUser = deleteOne(Users);
