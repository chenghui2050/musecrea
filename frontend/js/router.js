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
        <div class="icon">📊</div>
        <h3>{{ t('landing.feat1.title') }}</h3>
        <p>{{ t('landing.feat1.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon">🤖</div>
        <h3>{{ t('landing.feat2.title') }}</h3>
        <p>{{ t('landing.feat2.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <h3>{{ t('landing.feat3.title') }}</h3>
        <p>{{ t('landing.feat3.desc') }}</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>{{ t('landing.feat4.title') }}</h3>
        <p>{{ t('landing.feat4.desc') }}</p>
      </div>
    </div>
    <div class="cta-buttons">
      <button class="cta-btn cta-primary" onclick="location.hash='#/register'">{{ t('landing.register') }}</button>
      <button class="cta-btn cta-secondary" onclick="location.hash='#/login'">{{ t('landing.login') }}</button>
    </div>
    <div style="position:absolute;top:20px;right:20px;">
      <button @click="toggleLang" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;">{{ currentLang === 'zh' ? 'English' : '中文' }}</button>
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
      ]
    },
  ]
});
