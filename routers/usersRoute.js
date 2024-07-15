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
  getCurrentUser,
  getMe,
} = require('../controllers/usersController');
const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
  authorizeTo,
  logout,
} = require('../controllers/authController');

usersRouter.post('/signup', signup);
usersRouter.post('/login', login);
usersRouter.get('/logout', logout);
usersRouter.post('/forgetPassword', forgetPassword);
usersRouter.patch('/resetPassword/:token', resetPassword);
usersRouter.use(protect);
usersRouter.get('/me', getCurrentUser, getMe);
usersRouter.patch('/updatePassword', updatePassword);
usersRouter.patch('/updateAccount', updateAccount);
usersRouter.delete('/deleteAccount', deleteAccount);
usersRouter.use(authorizeTo('admin'));
usersRouter.route('/').get(getAllUsers).post(addUser);
usersRouter.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);
module.exports = usersRouter;
