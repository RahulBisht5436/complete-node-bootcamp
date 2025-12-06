// Import axios for making HTTP requests
import axios from 'axios';
// Import custom alert function to show success/error messages
import { showAlerts } from './utilities/alert';

// Login function that sends user credentials to the backend API
const Login = async function (email, password) {
    console.log("ajsguasuauuydg")
    try {
        // Make a POST request to the login endpoint with email & password
        const response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: { email, password },
        });
        console.log("endpoint hitted")
        // Check if backend returned a success status
        if (response.data.status === 'success') {
            // Show success alert on successful login
            showAlerts('success', 'You are logged in successfully');

            // Redirect to homepage after alert disappears (after 2.5s)
            setTimeout(() => {
                window.location.href = '/';
            }, 2500);
        }
    } catch (error) {
        // Show error alert if login failed
        showAlerts('error', 'Check your email or password');
        console.log(error); // Log actual error in console for debugging
    }
};

// Logout function that clears JWT cookie from the server
const Logout = async function () {
    try {
        // Send GET request to logout endpoint
        const response = await axios({
            method: "GET",
            url: "http://127.0.0.1:3000/logout"
        });

        console.log(response, "this is the response");

        // If logout is successful according to backend response
        if (response.data.statusCode === 200) {
            showAlerts("success", "Logout Successfully");

            // Reload page after alert disappears to update UI
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        }

    } catch (error) {
        // Show alert if API request fails
        showAlerts("error", "Not able to logout");
        console.log(error); // Log actual error for debugging
    }
}

// Export both functions so they can be used in other modules
export { Login, Logout };
