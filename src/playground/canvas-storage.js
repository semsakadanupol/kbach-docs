// The first script in the canvas's <head> (canvas.ts), before any of the page's own: a sandbox
// with no origin has no localStorage, and reading window.localStorage there THROWS. Kbach's
// dark-mode store reads it as it loads, unguarded (in @kbach/browser, the CDN script an HTML
// page loads, and in @kbach/react), so without this the CDN script stopped with a
// SecurityError and styled nothing. The page gets a storage in memory instead: it works, and
// starts empty on every run (2026-11-27). Then the store's saved mode ('kbach-theme') is the
// preview's: dark when the moon button is on (the <html> tag has the dark class), else light,
// so the page opens in the preview's mode; the runtime keeps it in step (canvas-runtime.js).
(function () {
  function memoryStorage() {
    var data = new Map();
    return {
      getItem: function (k) { return data.has(String(k)) ? data.get(String(k)) : null; },
      setItem: function (k, v) { data.set(String(k), String(v)); },
      removeItem: function (k) { data.delete(String(k)); },
      clear: function () { data.clear(); },
      key: function (i) { var keys = Array.from(data.keys()); return i < keys.length ? keys[i] : null; },
      get length() { return data.size; },
    };
  }
  var replaced = false;
  ['localStorage', 'sessionStorage'].forEach(function (name) {
    try {
      void window[name];
    } catch {
      try {
        Object.defineProperty(window, name, { value: memoryStorage(), configurable: true });
        replaced = replaced || name === 'localStorage';
      } catch {
        // can't be replaced here: the page's own try/catch has to do
      }
    }
  });
  // (only in a storage of ours: a page with real storage keeps the mode its reader saved)
  if (replaced) window.localStorage.setItem('kbach-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
})();
