window.addEventListener('DOMContentLoaded', () => {
  const themeLink = document.getElementById('theme-link');
  const toggleBtn = document.getElementById('theme-toggle');

  // 1) On load, if user chose a theme last time, apply it
  const stored = localStorage.getItem('theme');
  if (stored) {
    themeLink.href = stored;
    toggleBtn.textContent = stored === 'style-dark.css' ? '☀️' : '🌙';
  }

  // 2) Switch themes on click
  toggleBtn.addEventListener('click', () => {
    const isDark = themeLink.getAttribute('href') === 'style-dark.css';
    const next  = isDark ? 'style-light.css' : 'style-dark.css';
    themeLink.href = next;
    localStorage.setItem('theme', next);
    // update the icon too
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
});
