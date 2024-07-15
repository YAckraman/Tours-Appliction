import '@babel/polyfill';
import { login, logout } from './login';
import { mapRender } from './mapbox';
import { updateSettings } from './updateNameAndEmail';
const mapBox = document.getElementById('map');
const form = document.querySelector('.form--login');
const updateDataForm = document.querySelector('.form-user-data');
const upddatePasswordBtn = document.querySelector('.update--password');
const updatePasswordForm = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
//if there is a mapbox
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.location);
  mapRender(locations);
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    logout();
  });
}
if (updateDataForm) {
  updateDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });
}
if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    upddatePasswordBtn.textContent = '...updating';
    const passwordCurrent = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, newPassword, newPasswordConfirm },
      'password',
    );
  });
  document.getElementById('password-current').value = '';
  document.getElementById('password').value = '';
  document.getElementById('password-confirm').value = '';
  upddatePasswordBtn.textContent = 'SAVE PASSWORD';
}
