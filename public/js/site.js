document.querySelectorAll('[data-confirm-logout]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      event.preventDefault();
    }
  });
});