const express = require('express');
const usersRouter = express.Router();
const {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser,
  updateAccount,
  deleteAccount,
} = require('../controllers/usersController');
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controllers/authController');
usersRouter.post('/signup', signup);
usersRouter.post('/login', login);
usersRouter.post('/forgetPassword', forgetPassword);
usersRouter.patch('/resetPassword/:token', resetPassword);
usersRouter.patch('/updatePassword', protect, updatePassword);
usersRouter.patch('/updateAccount', protect, updateAccount);
usersRouter.delete('/deleteAccount', protect, deleteAccount);
usersRouter.route('/').get(getAllUsers).post(addUser);
usersRouter.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);
module.exports = usersRouter;
