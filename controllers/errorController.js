const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate field value: "${err.keyValue.name}". Please use another value! `;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid  inout data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token! Please log in again', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again', 401);

////////////////////////////////

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProduction = (err, req, res) => {
  // API ERROR HANDLING
  if (req.originalUrl.startsWith('/api')) {
    //Oppeartional, trusted error: sned message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Unknow error, we don't want to leak it to the client

    //1,console out the error
    console.error('ERROR 💥', err);
    // 2, Send genric message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  // render unknow error
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later!',
  });
};

/////////////////////////////////

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle the case when client type the wrong ID
    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);

    // Handle duplicate name when create a new tour
    if (error.code === 11000) error = handleDuplicateErrorDB(error);

    if (error.errors) error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProduction(error, req, res);
  }
};
