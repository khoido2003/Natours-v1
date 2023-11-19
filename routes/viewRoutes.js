const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
} = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Check user log in

// DON'T NEED TO DO THIS BECAUSE IF USEING THIS MIDDLEWARE, WE WILL HAVE TO CHECK THE ISLGGEDIN AND PROTECT TWICE IN /ME ROUTE WHICH IS REALYY BAD FOR PERFOEMANCE

// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, getTour);
router.get('/login', authController.isLoggedIn, getLoginForm);
router.get('/me', authController.protect, getAccount);
router.get('/my-tours', authController.protect, getMyTours);

router.post('/submit-user-data', authController.protect, updateUserData);

module.exports = router;
