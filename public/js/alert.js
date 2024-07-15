const hideAlert = () => {
  const alertElement = document.querySelector('.alert');
  if (alertElement) alertElement.parentElement.removeChild(alertElement);
};

exports.displayAlert = (state, message) => {
  hideAlert();
  const element = `<div class='alert alert--${state}'>${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', element);
  window.setTimeout(() => {
    hideAlert();
  }, 5000);
};
