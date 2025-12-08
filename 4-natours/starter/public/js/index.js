// Import named functions from other modules
import { Login, Logout } from './login';
import { updateUserInfo } from './accountUpdate';
import { passwordChangeHandle } from './passwordChange';

// Polyfill for older browsers (supports async/await and modern JS features)
import '@babel/polyfill';

/* ---------------------------------
   USER LOGIN FUNCTIONALITY
----------------------------------- */

// Select login form from the DOM
const formElement = document.querySelector("form.form.loginForm");

// Run login logic only if login form exists
if (formElement) {

  // Submit handler for login form
  formElement.addEventListener("submit", function (e) {

    // Prevent auto page reload on form submission
    e.preventDefault();

    // Collect user input values
    const emailData = document.getElementById('email').value;
    const passwordData = document.getElementById('password').value;

    // Only trigger login if both fields are provided
    if (emailData && passwordData) {
      Login(emailData, passwordData);
    }
  });
}


/* ---------------------------------
   USER LOGOUT FUNCTIONALITY
----------------------------------- */

// Select all logout buttons in navigation/header
const logoutButtons = document.querySelectorAll(".logout_button");

// Attach logout event to each logout button if present
if (logoutButtons.length > 0) {
  logoutButtons.forEach(button => {
    button.addEventListener("click", Logout);
  });
}


/* ---------------------------------
   UPDATE USER BASIC INFORMATION
   (Name & Email)
----------------------------------- */

const formData = document.querySelector(".form-user-data");

if (formData) {
  formData.addEventListener("submit", (e) => {
    e.preventDefault();

    // Grab input elements
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const photoInput = document.getElementById("photo");

    if (!nameInput || !emailInput) return;

    // Original values rendered from server
    const originalEmail = emailInput.defaultValue;
    const originalName = nameInput.defaultValue;

    // Updated values entered by user
    const updatedEmail = emailInput.value.trim();
    const updatedName = nameInput.value.trim();

    // Check if any data has actually changed
    const isDataChanged =
      originalEmail !== updatedEmail || originalName !== updatedName || photoInput.files.length > 0;

    // Prevent unnecessary API call if no changes detected
    if (!isDataChanged) return;
    let formData = new FormData();
    formData.append('name', updatedName);
    formData.append('email', updatedEmail);
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    }
    // Send new data to API
    updateUserInfo('infoUpdate', formData);
  });
}


/* ---------------------------------
   UPDATE USER PASSWORD FUNCTIONALITY
----------------------------------- */

const passwordForm = document.querySelector(".form.form-user-settings");

if (passwordForm) {
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Fetch password field values from form
    const passwordCurrent = passwordForm.querySelector("#password-current").value;
    const password = passwordForm.querySelector("#password").value;
    const passwordConfirm = passwordForm.querySelector("#password-confirm").value;

    // Prepare object for password update API
    const infoObjectPassword = {
      newpassword: password,
      newpasswordconfirmed: passwordConfirm,
      originpassword: passwordCurrent
    };

    updateUserInfo('password', infoObjectPassword);
  });
}




// password change form operations
const passwordForgetUpdate = document.querySelector("form.password_forgot_update")
if(passwordForgetUpdate){
  passwordForgetUpdate.addEventListener('submit',(e)=>{
    e.preventDefault()
    console.log("arrived till here")
    passwordChangeHandle()
  })
}