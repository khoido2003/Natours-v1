const stripe = require('stripe')(
  'sk_test_51ODSq1A1Q9rtx2Y5HpXLYVQfWjITX9aO8LcaxmDaaCEnNoEE0JPVxBMFT3DDra3zlphQcTKn3vLNoK7TlYc0rsdM00R2zcsCuU',
);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1, Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2, Create checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

      customer_email: req.user.email,
      client_reference_id: req.params.tourId,

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: `${tour.summary}`,

              images: [
                `https://www.natours.dev/img/tours/${tour.imageCover}.jpg`,
              ],
              // images: ['https://www.natours.dev/img/tours/tour-1-cover.jpg'],
            },
          },
        },
      ],
    });
    // 3, Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    console.log(err);
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary becasue it is unsecure: everyone can do booking without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({
    tour,
    user,
    price,
  });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
