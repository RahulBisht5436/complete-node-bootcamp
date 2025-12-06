// Import the named function "Login" from the "login.js" file (must use the same name)
import { Login, Logout } from './login';

// Import Babel polyfill for older browsers (adds support for async/await, Promises, etc.)
import '@babel/polyfill';

// Select the form element from the DOM
const formElement = document.querySelector(".form");

// Check if the form exists on the page
if (formElement) {

    // Add event listener to handle form submission
    formElement.addEventListener("submit", function (e) {

        // Prevent the page from refreshing on form submission
        e.preventDefault();

        // Get the entered email and password values
        const emailData = document.getElementById('email').value;
        const passwordData = document.getElementById('password').value;

        // Ensure both email and password are filled before calling login function
        if (emailData && passwordData) {
            // Call the imported login function
            Login(emailData, passwordData);
        }
    });
}



//logout functionality 
const logoutButtons = document.querySelectorAll(".logout_button")
if(logoutButtons.length >0){
    logoutButtons.forEach(button=>{
        console.log(button)
        button.addEventListener("click",Logout)
    })
}
