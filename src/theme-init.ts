// Early, CSP-safe theme initialization (no inline script)
try {
  const saved = localStorage.getItem('theme');
  const theme = saved === 'dark' || saved === 'light'
    ? saved
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
} catch (_) {
  // Ignore errors accessing localStorage in restrictive environments
}

