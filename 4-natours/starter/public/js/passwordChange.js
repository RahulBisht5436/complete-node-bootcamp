import { showAlerts } from "./utilities/alert";
import axios from "axios";

const passwordChangeHandle = async () => {
  const newPasswordEl = document.querySelector("form.password_forgot_update #password");
  const confirmNewPasswordEl = document.querySelector("form.password_forgot_update #password-confirm");

  if (!newPasswordEl || !confirmNewPasswordEl) {
    showAlerts("error", "Password fields not found on the page");
    return;
  }

  const newPassword = newPasswordEl.value.trim();
  const confirmNewPassword = confirmNewPasswordEl.value.trim();

  if (newPassword !== confirmNewPassword) {
    showAlerts("error", "Passwords are not the same!");
    return;
  }

  const resetPasswordTokenId = location.href.split("resetPassword/")[1];
  if (!resetPasswordTokenId) {
    showAlerts("error", "Invalid reset token");
    return;
  }

  try {
    await axios({
      method: "PATCH",
      url: `http://127.0.0.1:3000/api/v1/users/resetPassword/${resetPasswordTokenId}`,
      data: {
        newpassword: newPassword,
        newpasswordconfirmed: confirmNewPassword
      }
    });

    showAlerts("success", "Password updated. Please log in again");

    const logoutButton = document.querySelector("button.nav__el.logout_button");
    if (logoutButton) logoutButton.click();

  } catch (error) {
    showAlerts("error", error?.response?.data?.message || "There was an error changing password; try again later");
    console.error(error);
  }
};

export { passwordChangeHandle };