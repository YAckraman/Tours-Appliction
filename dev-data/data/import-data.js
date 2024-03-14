const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
dotenv.config({
  path: './config.env',
});
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

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
    const tour = await Tour.create(tours);
    console.log('data is inserted');
  } catch (err) {
    console.log(err);
  }
};
const deleteData = async () => {
  try {
    await Tour.remove();
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
