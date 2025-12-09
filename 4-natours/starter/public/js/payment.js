import { showAlerts } from "./utilities/alert";
import axios from "axios";

// Initialize Stripe with the **publishable key**
// ❌ Never store secret keys in frontend files
const stripe = Stripe('pk_test_51ScGjbBmllpMX83BEvpZNTa1Skv33jR797OcwdBk3WmqVHj8yiOmBKU04upR6iqKzoiaSpWvXngEoPxtzDl8z02X00wolTP2Fv');

/**
 * Initiates Stripe checkout for a specific tour booking.
 * @param {string} tourId - ID of the tour to be booked
 */
const processTourPayment = async (tourId) => {
    try {
        console.log("inside correct function");

        // 1️⃣ Request the Checkout Session from our backend
        // Backend will communicate with Stripe secret key safely
        const session = await axios({
            method: 'get',
            url: `${window.location.origin}/api/v1/bookings/checkout-session/${tourId}`
        });

        // 2️⃣ Automatically redirect user to Stripe checkout page
        // using session ID generated from backend
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

        // Debugging log (only visible in browser console)
        console.log(session.data.session);

    } catch (error) {
        // Show user-friendly alert if anything goes wrong
        showAlerts("error", "Sorry , Booking can't be processed");
    }
};

export default processTourPayment;
