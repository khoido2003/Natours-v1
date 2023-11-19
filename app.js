const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

/////////////////////////////////

const app = express();

// Connect Pug template to expressJS
app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));

////////////////////

// SERVING STATIC FILE
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1, Global Middleware

// SECURITY HTTP HEADER
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com/v3/'],
      frameSrc: ["'self'", 'https://js.stripe.com/v3/'],
      connectSrc: [
        "'self'",
        'blob:',
        'wss:',
        'ws:',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
        'ws://127.0.0.1:56623',
      ],

      imgSrc: ["'self'", 'https:', 'data:'],
    },
  }),
);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// LIMIT RATE REQUEST API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// BODY PARSER: reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Form data parser come from url ecode form
app.use(
  express.urlencoded({
    extended: true,
    // limit: '10kb'
  }),
); // handle the data when we post a form to the database

// COOKIE-PARSER
app.use(cookieParser());

// DATA SANITIZATION AGAINSR NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION
app.use(xss());

// PREVENT PARAMS POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
      'maxGroupSize',
    ], // accept duplicate params
  }),
);

app.use(compression());

// app.use((req, res, next) => {
//   // eslint-disable-next-line no-console
//   console.log('hello from the middleware 😋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);

  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', getTour);
// app.get('/api/v1/tours/:id', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

////////////////

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // // Create an error
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // Trigger error using next()
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

/////////////////////

// HANDLE ERROR

app.use(globalErrorHandler);

//////////////////

module.exports = app;
