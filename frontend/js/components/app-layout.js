// App Layout Component
const AppLayout = {
  template: `
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="logo" @click="$router.push('/dashboard')" style="cursor:pointer">
        MuseCrea<span>{{ t('app.subtitle') }}</span>
      </div>
      <div class="header-right">
        <span class="credits-badge">💰 {{ userCredits }} {{ t('nav.credits') }}</span>
        <button @click="toggleLang" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;margin-right:12px;">{{ currentLang === 'zh' ? 'EN' : '中' }}</button>
        <el-dropdown @command="handleCommand">
          <span style="color:white;cursor:pointer;font-size:14px;">
            {{ userName }} ▾
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">👤 {{ t('nav.profileInfo') }}</el-dropdown-item>
              <el-dropdown-item command="admin" v-if="isAdmin">⚙️ {{ t('nav.admin') }}</el-dropdown-item>
              <el-dropdown-item command="logout" divided>🚪 {{ t('nav.logout') }}</el-dropdown-item>
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
            <span class="icon">📊</span> {{ t('nav.dashboard') }}
          </li>
          <li :class="{ active: $route.path === '/upload' }" @click="$router.push('/upload')">
            <span class="icon">📤</span> {{ t('nav.upload') }}
          </li>
          <li :class="{ active: $route.path === '/history' }" @click="$router.push('/history')">
            <span class="icon">📋</span> {{ t('nav.history') }}
          </li>
          <li :class="{ active: $route.path === '/profile' }" @click="$router.push('/profile')">
            <span class="icon">👤</span> {{ t('nav.profile') }}
          </li>
          <li v-if="isAdmin" :class="{ active: $route.path === '/admin' }" @click="$router.push('/admin')">
            <span class="icon">⚙️</span> {{ t('nav.admin') }}
          </li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="app-content">
        <router-view @refresh-user="fetchUser"></router-view>
      </main>
    </div>
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

    return { isAdmin, userName, userCredits, handleCommand, fetchUser, t, currentLang, toggleLang };
  }
};
