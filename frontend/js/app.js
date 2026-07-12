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

// Redirect to dashboard if already logged in and on landing page
router.beforeEach((to, from, next) => {
  if (to.path === '/' && isLoggedIn()) {
    next('/dashboard');
  } else {
    next();
  }
});
