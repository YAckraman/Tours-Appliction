import axios from 'axios';
import { displayAlert } from './alert';
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:3000/api/v1/users/updateAccount'
        : 'http://127.0.0.1:3000/api/v1/users/updatePassword';
    const response = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(response.status);
    if (response.data.status === 'success')
      displayAlert('success', `${type} updated successfully`);
  } catch (err) {
    console.log(err.response.data.message);
    displayAlert('error', err.response.data.message);
  }
};
