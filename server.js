const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({
  path: './config.env',
});
process.on('uncaughtException', (err) => {
  console.log(err.message, err.name);
  process.exit(1);
});
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

const port = process.env.port || 3000;
console.log(port);
let server = app.listen(port, () => {
  console.log(`welcome to server on port ${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log(err.message, err.name);
  server.close(() => {
    process.exit(1);
  });
});
module.exports = app;
