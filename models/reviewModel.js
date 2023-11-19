const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    createAt: {
      type: Date,
      default: Date.now(),
    },
    // tours: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Tour',
    //     validate: {
    //       validator: function (value) {
    //         return value.length > 0;
    //       },
    //       message: 'Review must belong to a tour',
    //     },
    //     required: [true, 'Review must belong to a tour'],
    //   },
    // ],
    // users: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     validate: {
    //       validator: function (value) {
    //         return value.length > 0;
    //       },
    //       message: 'Review must belong to a user',
    //     },
    //     required: [true, 'Review must belong to a user'],
    //   },
    // ],

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  { unique: true },
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  // next();

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

////////////////////////////////////

// Calculating average Rating on tours
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Avoid there is no document left
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].avgRating,
      ratingQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  // this point to current review
  this.constructor.calcAverageRatings(this.tour);
});

//////////////////////////

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // the "this" keyword is the current querry
  this.r = await this.clone().findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //   this.r = await this.findOne();: DOES NOT WORK HERE BECAUSE IT ALREADY EXECUTED
  if (this.r) {
    // Check if the result is available
    await this.r.constructor.calcAverageRatings(this.r.tour);
  }
});

////////////////////////////////

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

////////////////////////////////////////

// // Custom validator to ensure that the 'tours' and 'users' arrays are not empty
// reviewSchema.path('tours').validate(function (value) {
//   return value.length > 0;
// }, 'Review must belong to a tour');

// reviewSchema.path('users').validate(function (value) {
//   return value.length > 0;
// }, 'Review must belong to a user');

//////////////////////////////
