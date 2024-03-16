const checkAsync = require('./../utils/chechAsync');
const AppError = require('./../utils/AppError');
const apiFeatures = require('./../utils/apiFeatures');
exports.deleteOne = (Model) =>
  checkAsync(async (req, res, next) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) {
      return next(new AppError(`no document with that id`, 400));
    }
    res.status(204).json({
      status: 'success',
      data: 'null',
    });
  });
exports.updateOne = (Model) =>
  checkAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError(`no document with that id`, 400));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });
exports.createOne = (Model) =>
  checkAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });
exports.getAll = (Model) =>
  checkAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    let query = Model.find(filter);
    //if (optionsObj) query = query.populate(optionsObj);
    let features = new apiFeatures(query, req.query)
      .filter()
      .sort()
      .filterFields()
      .pagination();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, options) =>
  checkAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (options) query = query.populate(options);
    const doc = await query;
    if (!doc) {
      return next(new AppError(`no document with that id`, 400));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
