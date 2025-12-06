const hideAlert = function () {
  const els = document.querySelectorAll('.alert');
  if (els.length > 0) {
    els.forEach(el => el.remove());
  }
  
};

const showAlerts = function (type, message) {
  hideAlert(); // Remove old alerts

  const markup = `<div class="alert alert--${type}">${message}</div>`;
  const bodyElement = document.querySelector('body');

  if (bodyElement) {
    // Insert HTML markup correctly
    bodyElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Hide alert after 2 seconds
  setTimeout(hideAlert, 2000);
};

export { showAlerts };
