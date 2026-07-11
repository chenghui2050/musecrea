// App Layout Component
const AppLayout = {
  template: `
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="logo" @click="$router.push('/dashboard')" style="cursor:pointer">
        <svg class="logo-icon" width="28" height="28" viewBox="0 0 32 32" shape-rendering="crispEdges" fill="currentColor">
          <rect x="14" y="0" width="4" height="2"/><rect x="12" y="2" width="8" height="2"/>
          <rect x="10" y="4" width="12" height="2"/><rect x="8" y="6" width="16" height="2"/>
          <rect x="6" y="8" width="20" height="2"/><rect x="4" y="10" width="24" height="2"/>
          <rect x="4" y="12" width="4" height="12"/><rect x="14" y="12" width="4" height="12"/>
          <rect x="24" y="12" width="4" height="12"/>
          <rect x="2" y="24" width="28" height="4"/><rect x="0" y="28" width="32" height="4"/>
        </svg>
        MuseCrea<span>{{ t('app.subtitle') }}</span>
      </div>
      <div class="header-right">
        <span class="credits-badge"><span class="px-icon px-coin"></span> {{ userCredits }} {{ t('nav.credits') }}</span>
        <button @click="toggleTheme" class="theme-toggle-btn" :title="isDark ? t('nav.lightMode') : t('nav.darkMode')">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor">
            <rect x="8" y="2" width="2" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/>
            <rect x="5" y="5" width="1" height="1"/><rect x="4" y="6" width="1" height="4"/><rect x="5" y="10" width="1" height="1"/>
            <rect x="6" y="11" width="1" height="1"/><rect x="7" y="12" width="1" height="1"/><rect x="8" y="13" width="2" height="1"/>
            <rect x="5" y="6" width="1" height="1"/><rect x="5" y="9" width="1" height="1"/><rect x="6" y="7" width="1" height="2"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor">
            <rect x="7" y="0" width="2" height="2"/><rect x="7" y="14" width="2" height="2"/>
            <rect x="0" y="7" width="2" height="2"/><rect x="14" y="7" width="2" height="2"/>
            <rect x="3" y="3" width="1" height="1"/><rect x="12" y="3" width="1" height="1"/>
            <rect x="3" y="12" width="1" height="1"/><rect x="12" y="12" width="1" height="1"/>
            <rect x="6" y="5" width="4" height="1"/><rect x="5" y="6" width="6" height="4"/>
            <rect x="6" y="10" width="4" height="1"/>
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
          <svg class="footer-icon" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="6" y="1" width="4" height="2" fill="#209cee"/><rect x="4" y="3" width="8" height="2" fill="#209cee"/><rect x="5" y="5" width="6" height="2" fill="#209cee"/><rect x="6" y="7" width="4" height="2" fill="#209cee"/><rect x="3" y="9" width="10" height="2" fill="#209cee"/><rect x="2" y="11" width="12" height="2" fill="#209cee"/><rect x="4" y="13" width="8" height="2" fill="#209cee"/></svg>
          <span>程辉 · 浙江财经大学东方学院</span>
        </span>
        <span class="footer-item">
          <svg class="footer-icon" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="3" width="12" height="2" fill="#209cee"/><rect x="2" y="5" width="2" height="6" fill="#209cee"/><rect x="12" y="5" width="2" height="6" fill="#209cee"/><rect x="2" y="11" width="12" height="2" fill="#209cee"/><rect x="4" y="5" width="8" height="2" fill="#f7d51d"/><rect x="4" y="7" width="2" height="2" fill="#f7d51d"/><rect x="10" y="7" width="2" height="2" fill="#f7d51d"/></svg>
          <a href="mailto:chenghui2050@163.com" class="footer-email">chenghui2050@163.com</a>
        </span>
        <span class="footer-item">
          <svg class="footer-icon" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="1" width="10" height="2" fill="#05ffa1"/><rect x="1" y="3" width="14" height="2" fill="#05ffa1"/><rect x="1" y="5" width="14" height="2" fill="#05ffa1"/><rect x="1" y="7" width="14" height="2" fill="#05ffa1"/><rect x="3" y="9" width="10" height="2" fill="#05ffa1"/><rect x="5" y="11" width="6" height="2" fill="#05ffa1"/><rect x="6" y="13" width="4" height="2" fill="#05ffa1"/></svg>
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

    // Theme toggle
    const isDark = Vue.ref(localStorage.getItem('musecrea_theme') !== 'light');

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

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      localStorage.setItem('musecrea_theme', isDark.value ? 'dark' : 'light');
      applyTheme(isDark.value);
    };

    // Apply saved theme on mount
    Vue.onMounted(() => {
      applyTheme(isDark.value);
    });

    return { isAdmin, userName, userCredits, handleCommand, fetchUser, t, currentLang, toggleLang, isDark, toggleTheme };
  }
};
