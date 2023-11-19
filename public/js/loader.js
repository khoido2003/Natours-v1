document.addEventListener('DOMContentLoaded', () => {
  // Show loader when the page starts loading
  document.querySelector('.loader').style.display = 'block';
  document.querySelectorAll('.section').forEach((section) => {
    section.style.display = 'hidden';
  });
  document.body.style.overflow = 'hidden';

  // Hide loader when all assets (including data) are loaded
  window.addEventListener('load', () => {
    document.querySelector('.loader').style.display = 'none';
    document.querySelector('.modal--loader').style.display = 'none';
    document.querySelectorAll('.section').forEach((section) => {
      section.style.display = 'block';
    });
    document.body.style.overflow = 'scroll';
  });
});
