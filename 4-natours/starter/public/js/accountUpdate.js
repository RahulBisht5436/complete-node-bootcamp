import axios from 'axios';
import { showAlerts } from './utilities/alert';

// updateUserInfo()
// Handles updating either:
// 1️⃣ Basic user info (name, email)
// 2️⃣ User password
//
// Parameters:
// - type: "infoUpdate" or "password"
// - infoObject: Data object that will be sent in request body
//
const updateUserInfo = async function (type, infoObject) {
    try {
        let endPoint = "";
        let method = "POST";

        // Determine correct API endpoint & request method
        if (type === "infoUpdate") {
            endPoint = "updateMe";
            method = "POST"; // Update basic details uses POST
        } else if (type === "password") {
            endPoint = "updatepassword";
            method = "PATCH"; // Password updates require PATCH
        } else {
            // If type is invalid, exit silently
            return;
        }

        // Send update request to backend
        const response = await axios({
            method,
            url: `http://127.0.0.1:3000/api/v1/users/${endPoint}`,
            data: infoObject,
        });

        // Show success notification to user
        showAlerts('success', 'Updated successfully!');
        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (error) {
        // Show error message returned by the server
        showAlerts('error', error.response.data.message);

        // Log in console for debugging
        console.log(error.response.data.message);
    }
};

// Export function for use in other modules
export { updateUserInfo };
