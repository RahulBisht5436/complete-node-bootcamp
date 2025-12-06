import axios from 'axios';
import { showAlerts } from './utilities/alert';

const Login = async function (email, password) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    if (response.data.status === 'success') {
      showAlerts('success', 'You are logged in successfully');

      // Redirect after Alert disappears
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    }
  } catch (error) {
    showAlerts('error', 'Check your email or password');
    console.log(error);
  }
};

export { Login };
