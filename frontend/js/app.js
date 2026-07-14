// Main App Initialization
const app = Vue.createApp({});

// Use Element Plus with correct locale
const elLocale = MuseCreaI18n.current === 'en' ? ElementPlusLocaleEn : ElementPlusLocaleZhCn;
app.use(ElementPlus, { locale: elLocale });

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Register global components
app.component('image-library-modal', ImageLibraryModal);

// Make translation function globally available
app.config.globalProperties.$t = t;

// Use Router
app.use(router);

// Set page title and lang attribute
document.title = t('app.title');
document.documentElement.lang = MuseCreaI18n.current === 'zh' ? 'zh-CN' : 'en';

// Dark mode is default - no localStorage check needed

// Mount
app.mount('#app');

// Force dark mode after mount (guard against browser extensions overriding theme)
(function() {
  var html = document.documentElement;

  var forceDark = function() {
    html.setAttribute('data-theme', 'dark');
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
    var d = document.getElementById('dark-theme');
    if (d) d.removeAttribute('disabled');
  };

  forceDark();

  // Re-force after Vue finishes rendering
  setTimeout(forceDark, 500);

  // Watch for external changes to data-theme (e.g. browser extensions)
  // Skip revert if user intentionally toggled (window.__userThemeChange flag)
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.attributeName === 'data-theme') {
        var val = html.getAttribute('data-theme');
        if (val !== 'dark' && !window.__userThemeChange) {
          forceDark();
        }
      }
    });
  });
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
})();

// Hide splash screen after minimum display time
(function() {
  var splash = document.getElementById('splash-screen');
  if (splash) {
    var elapsed = Date.now() - (window.__splashStart || 0);
    var delay = Math.max(0, 2400 - elapsed);
    setTimeout(function() {
      splash.classList.add('hide');
      setTimeout(function() { splash.remove(); }, 700);
    }, delay);
  }
})();

// Redirect to dashboard if already logged in and on landing page
router.beforeEach((to, from, next) => {
  if (to.path === '/' && isLoggedIn()) {
    next('/dashboard');
  } else {
    next();
  }
});
