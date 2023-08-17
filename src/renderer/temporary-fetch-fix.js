// !!!!
// !!! horrible 'hack'? ???
// !!! CHANGE !!!
// This is horrible. Scratch.fetch disables redirects, but in the desktop app, sidekick-extensions.mixality.de
// is implemented with a redirect. So just until we find a better way to do this, we'll do this horrible
// hack instead.
const originalFetch = window.fetch;
window.fetch = function fetchWithRedirectFix(url, options) {
  // !!! CHANGE !!!
  // !!!!!HERE!!!!!
  // if (typeof url === 'string' && url.startsWith('https://mixality.github.io/Sidekick/sidekick-extensions/') && options) {
  // if (typeof url === 'string' && (url.startsWith('http://localhost') || url.startsWith('https://menersar.github.io/Sidekick/sidekick-extensions/')) && options) {
  // !!! NEU
  // if (typeof url === 'string' && options) {
  if (
    typeof url === "string" &&
    url.startsWith("https://extensions.turbowarp.org/") &&
    options
  ) {
    options.redirect = "follow";
  } else if (
    typeof url === "string" &&
    url.startsWith("https://menersar.github.io/") &&
    options
  ) {
    options.redirect = "follow";
  }
  return originalFetch.call(this, url, options);
};
