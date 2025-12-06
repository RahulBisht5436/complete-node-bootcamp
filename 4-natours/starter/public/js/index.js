// Import the named function "Login" from the "login.js" file (must use the same name)
import { Login, Logout } from './login';
import { updateUserInfo } from './accountUpdate';

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



const formData = document.querySelector(".form-user-data");
if (formData) {
  formData.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    if (!nameInput || !emailInput) return;

    // Original values from server-rendered attributes
    const originalEmail = emailInput.defaultValue;
    const originalName = nameInput.defaultValue;

    // New values entered by user
    const updatedEmail = emailInput.value.trim();
    const updatedName = nameInput.value.trim();

    // Only call update API if there is an actual change
    const isDataChanged =
      originalEmail !== updatedEmail || originalName !== updatedName;
    if (!isDataChanged) {
      return;
    }


    updateUserInfo(updatedEmail, updatedName, user);
  });
}
