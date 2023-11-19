import axios from 'axios';
import { showAlert } from './alert.mjs';

/*eslint-disable*/
const stripe = Stripe(
  'pk_test_51ODSq1A1Q9rtx2Y5uhsdxsj3fDWVGMsTJULhTvlfMt4UC13SXgM7elJVa74PrS2s7OV3hfs5ebnFwNIZKmcvmw8m00yvAJNM0l',
);

export const bookTour = async (tourId) => {
  try {
    // 1. Get checkout session from API
    const res = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
    console.log(err);
  }
};
