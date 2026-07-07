// Main App Initialization
const app = Vue.createApp({});

// Use Element Plus
app.use(ElementPlus, { locale: ElementPlusLocaleZhCn });

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Register global components
app.component('image-library-modal', ImageLibraryModal);

// Use Router
app.use(router);

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
