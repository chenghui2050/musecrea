// App Layout Component
const AppLayout = {
  template: `
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="logo" @click="$router.push('/dashboard')" style="cursor:pointer">
        <img class="logo-icon" src="/img/icon-logo.png" alt="MuseCrea" />
        MuseCrea<span>{{ t('app.subtitle') }}</span>
      </div>
      <div class="header-right">
        <span class="credits-badge">{{ userCredits }} {{ t('nav.credits') }}</span>
        <button @click="toggleTheme" class="theme-toggle-btn" :title="isDark ? t('nav.lightMode') : t('nav.darkMode')">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button @click="toggleLang" class="lang-toggle-btn">{{ currentLang === 'zh' ? 'EN' : '中' }}</button>
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown-trigger">
            {{ userName }} ▾
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile"><span class="px-icon px-person"></span> {{ t('nav.profileInfo') }}</el-dropdown-item>
              <el-dropdown-item command="admin" v-if="isAdmin"><span class="px-icon px-gear"></span> {{ t('nav.admin') }}</el-dropdown-item>
              <el-dropdown-item command="logout" divided><span class="px-icon px-door"></span> {{ t('nav.logout') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div style="display:flex;margin-top:60px;">
      <!-- Sidebar -->
      <aside class="app-sidebar">
        <ul class="sidebar-menu">
          <li :class="{ active: $route.path === '/dashboard' }" @click="$router.push('/dashboard')">
            <span class="icon pix-dashboard"></span> {{ t('nav.dashboard') }}
          </li>
          <li :class="{ active: $route.path === '/upload' }" @click="$router.push('/upload')">
            <span class="icon pix-upload"></span> {{ t('nav.upload') }}
          </li>
          <li :class="{ active: $route.path === '/history' }" @click="$router.push('/history')">
            <span class="icon pix-history"></span> {{ t('nav.history') }}
          </li>
          <li :class="{ active: $route.path === '/profile' }" @click="$router.push('/profile')">
            <span class="icon pix-profile"></span> {{ t('nav.profile') }}
          </li>
          <li v-if="isAdmin" :class="{ active: $route.path === '/admin' }" @click="$router.push('/admin')">
            <span class="icon pix-admin"></span> {{ t('nav.admin') }}
          </li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="app-content">
        <router-view @refresh-user="fetchUser"></router-view>
      </main>
    </div>

    <!-- Global Footer -->
    <footer class="app-footer">
      <div class="footer-row">
        <span class="footer-item">
          <img class="footer-icon" src="/img/icon-author.png" alt="author" style="width:16px;height:16px;" />
          <span>程辉 · 浙江财经大学东方学院</span>
        </span>
        <span class="footer-item">
          <img class="footer-icon" src="/img/icon-email.png" alt="email" style="width:16px;height:16px;" />
          <a href="mailto:chenghui2050@163.com" class="footer-email">chenghui2050@163.com</a>
        </span>
        <span class="footer-item">
          <img class="footer-icon" src="/img/icon-wechat.png" alt="wechat" style="width:16px;height:16px;" />
          <span>{{ t('footer.wechat') }}</span>
        </span>
      </div>
      <div class="footer-version">MuseCrea V4.0 · 2026-07-11</div>
    </footer>
  </div>
  `,
  setup() {
    const router = VueRouter.useRouter();

    // Use separate reactive refs for guaranteed reactivity
    const isAdmin = Vue.ref(false);
    const userName = Vue.ref(t('nav.defaultUser'));
    const userCredits = Vue.ref(0);

    // Read from localStorage first (instant render)
    const cached = getUser();
    if (cached) {
      isAdmin.value = cached.role === 'admin';
      userName.value = cached.username || t('nav.defaultUser');
      userCredits.value = cached.credits || 0;
    }

    // Always fetch fresh data from API on mount
    const fetchUser = async () => {
      try {
        const freshUser = await authApi.getMe();
        isAdmin.value = freshUser.role === 'admin';
        userName.value = freshUser.username || t('nav.defaultUser');
        userCredits.value = freshUser.credits || 0;
        localStorage.setItem('musecrea_user', JSON.stringify(freshUser));
        console.log('[MuseCrea] User role:', freshUser.role);
      } catch (e) {
        console.error('[MuseCrea] Failed to refresh user:', e);
      }
    };

    Vue.onMounted(fetchUser);

    const handleCommand = (cmd) => {
      if (cmd === 'profile') router.push('/profile');
      else if (cmd === 'admin') router.push('/admin');
      else if (cmd === 'logout') {
        logout();
        router.push('/');
        window.location.reload();
      }
    };

    const currentLang = Vue.ref(MuseCreaI18n.current);
    const toggleLang = () => {
      MuseCreaI18n.setLocale(currentLang.value === 'zh' ? 'en' : 'zh');
    };

    // Theme toggle - read saved preference, default to dark mode
    const savedTheme = localStorage.getItem('musecrea_theme_v2');
    const isDark = Vue.ref(savedTheme !== 'light');

    const applyTheme = (dark) => {
      const html = document.documentElement;
      const darkLink = document.getElementById('dark-theme');
      if (dark) {
        html.setAttribute('data-theme', 'dark');
        html.classList.add('dark');
        if (darkLink) darkLink.removeAttribute('disabled');
      } else {
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark');
        if (darkLink) darkLink.setAttribute('disabled', '');
      }
    };

    // Apply theme immediately (before first render) to sync with inline script
    applyTheme(isDark.value);

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      localStorage.setItem('musecrea_theme_v2', isDark.value ? 'dark' : 'light');
      applyTheme(isDark.value);
    };

    return { isAdmin, userName, userCredits, handleCommand, fetchUser, t, currentLang, toggleLang, isDark, toggleTheme };
  }
};
