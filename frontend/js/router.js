// Vue Router Setup
const { createRouter, createWebHashHistory } = VueRouter;

// Landing page component (no auth required)
const LandingPage = {
  template: `
  <div class="landing">
    <h1>MuseCrea</h1>
    <p class="tagline">{{ t('landing.tagline') }}</p>
    <div class="features">
      <div class="feature-card">
        <div class="icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span></div>
        <h3>{{ t('landing.feat1.title') }}</h3>
        <p>{{ t('landing.feat1.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></span></div>
        <h3>{{ t('landing.feat2.title') }}</h3>
        <p>{{ t('landing.feat2.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span></div>
        <h3>{{ t('landing.feat3.title') }}</h3>
        <p>{{ t('landing.feat3.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span></div>
        <h3>{{ t('landing.feat4.title') }}</h3>
        <p>{{ t('landing.feat4.desc') }}</p>
      </div>
    </div>
    <div class="cta-buttons">
      <button class="cta-btn cta-primary" onclick="location.hash='#/register'">{{ t('landing.register') }}</button>
      <button class="cta-btn cta-secondary" onclick="location.hash='#/login'">{{ t('landing.login') }}</button>
    </div>
    <div style="position:absolute;top:20px;right:20px;">
      <button @click="toggleLang" class="lang-toggle-btn">{{ currentLang === 'zh' ? 'English' : '中文' }}</button>
    </div>
  </div>
  `,
  setup() {
    const currentLang = Vue.ref(MuseCreaI18n.current);
    const toggleLang = () => {
      MuseCreaI18n.setLocale(currentLang.value === 'zh' ? 'en' : 'zh');
    };
    return { t, currentLang, toggleLang };
  }
};

// Auth guard
function requireAuth(to, from, next) {
  if (!isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password', component: ResetPasswordPage },
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: 'dashboard', component: DashboardPage, beforeEnter: requireAuth },
        { path: 'upload', component: UploadPage, beforeEnter: requireAuth },
        { path: 'results/:id', component: ResultsPage, beforeEnter: requireAuth },
        { path: 'results', component: ResultsPage, beforeEnter: requireAuth },
        { path: 'report/:id', component: ReportPage, beforeEnter: requireAuth },
        { path: 'history', component: HistoryPage, beforeEnter: requireAuth },
        { path: 'admin', component: AdminPage, beforeEnter: requireAuth },
        { path: 'profile', component: ProfilePage, beforeEnter: requireAuth },
        { path: 'guide', component: GuidePage, beforeEnter: requireAuth },
        { path: 'articles', component: ArticlesPage, beforeEnter: requireAuth },
      ]
    },
  ]
});
