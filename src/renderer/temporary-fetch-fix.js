// !!!!
// !!! horrible 'hack'? ???
// !!! CHANGE !!!
// This is horrible. Scratch.fetch disables redirects, but in the desktop app, Sidekick/extensions
// is implemented with a redirect. So just until we find a better way to do this, we'll do this horrible
// hack instead.
const originalFetch = window.fetch;
window.fetch = function fetchWithRedirectFix (url, options) {
    // !!! CHANGE !!!
    // !!!!!HERE!!!!!
    // if (typeof url === 'string' && url.startsWith('https://mixality.github.io/Sidekick/extensions/') && options) {
    if (typeof url === 'string' && url.startsWith('https://menersar.github.io/Sidekick/extensions/') && options) {
        options.redirect = 'follow';
    }
    return originalFetch.call(this, url, options);
};
