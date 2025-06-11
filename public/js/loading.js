// public/js/loading.js
(function () {
  const loadingOverlay = document.getElementById('loading-overlay');

  function showLoading() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
    }
  }

  function hideLoading() {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }

  // Show loading on link clicks to the same origin, not # links or target=_blank
  document.addEventListener('click', function (event) {
    const target = event.target.closest('a');
    if (
      target &&
      target.href &&
      target.origin === window.location.origin &&
      !target.href.startsWith(window.location.href + '#') &&
      target.getAttribute('target') !== '_blank' &&
      !target.classList.contains('no-loader') // Add a class to exclude specific links if needed
    ) {
      showLoading();
    }
  });

  // Hide loading when the new page is shown (covers back/forward buttons)
  window.addEventListener('pageshow', hideLoading);

  // Ensure it's hidden on initial load, in case of fast caching
  window.addEventListener('DOMContentLoaded', hideLoading);
})();
