import axios from 'axios';
import { displayAlert } from './alert';
export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    displayAlert('success', 'login successfully');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } catch (err) {
    displayAlert('error', err.response.data.message);
  }
};
export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (response.data.status == 'success') location.reload(true);
  } catch (err) {
    displayAlert('error', err.response.data.message);
  }
};
