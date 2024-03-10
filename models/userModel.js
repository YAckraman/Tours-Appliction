const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');
const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'user must have an email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'please provide a valid mail'],
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordConfirm: {
    type: String,
    required: [true, 'user must match the password'],
    //works only on save and create
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password does not match',
    },
  },
  image: {
    type: String,
  },
  changedAt: Date,
  resestPassword: String,
  expiresAt: Date,
  //state of the account
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
//create a pre save hook to auto update changeAt field in document before save
usersSchema.pre('save', function (next) {
  //check if password is not modified and it is not document
  if (!this.isModified('password') || !this.isNew) return next();
  //update the changeAt field in docs to by the current time - 1s be
  this.changedAt = Date.now() - 1000;
  next();
});
usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
usersSchema.methods.changedPassword = function (createdAt) {
  if (this.changedAt) {
    const changedConv = parseInt(this.changedAt.getTime() / 1000, 10);
    console.log(createdAt, changedConv);
    return changedConv > createdAt;
  }
  return false;
};
usersSchema.methods.correctPassword = async function (
  candidatePass,
  schemaPass,
) {
  const val = await bcrypt.compare(candidatePass, schemaPass);
  return val;
};
usersSchema.methods.createPasswordChangeToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resestPassword = crypto.createHash('sha256').update(token).digest('hex');
  console.log({ token }, this.resestPassword);
  this.expiresAt = Date.now() + 10 * 60 * 1000;
  return token;
};
const Users = mongoose.model('Users', usersSchema);
module.exports = Users;
