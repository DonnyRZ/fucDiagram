// Early, CSP-safe theme initialization (no inline script)
try {
  // Set light theme as default
  document.documentElement.setAttribute('data-theme', 'light');
} catch (_) {
  // Ignore errors accessing localStorage in restrictive environments
}

