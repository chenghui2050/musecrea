// Vue Router Setup
const { createRouter, createWebHashHistory } = VueRouter;

// Landing page component (no auth required)
const LandingPage = {
  template: `
  <div class="landing">
    <h1>MuseCrea</h1>
    <p class="tagline">博物馆文创产品创意评价计算平台 —— 基于随机森林算法与大语言模型，为文创产品提供专业、量化的创意度评估与消费者洞察分析</p>
    <div class="features">
      <div class="feature-card">
        <div class="icon">📊</div>
        <h3>多维量化评价</h3>
        <p>新颖度、有用性、情感性、设计美学、文化价值五维综合评估</p>
      </div>
      <div class="feature-card">
        <div class="icon">🤖</div>
        <h3>AI 智能分析</h3>
        <p>通义千问大模型深度分析消费者评论，生成改进建议</p>
      </div>
      <div class="feature-card">
        <div class="icon">📈</div>
        <h3>可视化报告</h3>
        <p>雷达图、维度排名、综合评分，一目了然的评价结果</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>安全可靠</h3>
        <p>数据加密传输，评价历史云端存储，随时追溯对比</p>
      </div>
    </div>
    <div class="cta-buttons">
      <button class="cta-btn cta-primary" onclick="location.hash='#/register'">立即注册</button>
      <button class="cta-btn cta-secondary" onclick="location.hash='#/login'">已有账号？登录</button>
    </div>
  </div>
  `
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
