const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
dotenv.config({
  path: './config.env',
});
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
const con = mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('ya leelah');
  });
const createData = async () => {
  try {
    //const tour = await Tour.create(tours);
    //const user = await User.create(users, { validateBeforeSave: false });
    const review = await Review.create(reviews);
    console.log('data is inserted');
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    const removed = await Promise.all([
      Tour.deleteMany(),
      User.deleteMany(),
      Review.deleteMany(),
    ]);
    // await Tour.re();
    // await User.deleteMany();

    console.log('data is deleted');
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] == '--delete') {
  deleteData();
} else if (process.argv[2] == '--create') {
  createData();
}
console.log(process.argv);
// const port = process.env.port || 3000;
// console.log(port);
// app.listen(port, () => {
//   console.log(`welcome to server on port ${port}`);
// });
