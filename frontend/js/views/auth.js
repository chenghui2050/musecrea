// Auth Views - Login & Register
const LoginPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.welcome') }}</h2>
      <p class="subtitle">{{ t('auth.loginSubtitle') }}</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" :placeholder="t('auth.username')" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('auth.password')" size="large" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleLogin">{{ t('auth.login') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="switch-link">
        {{ t('auth.noAccount') }}<a @click="$router.push('/register')">{{ t('auth.registerNow') }}</a>
      </div>
      <div class="switch-link" style="margin-top:10px">
        <a @click="$router.push('/')">{{ t('auth.backHome') }}</a>
      </div>
    </div>
  </div>
  `,
  setup() {
    const formRef = Vue.ref(null);
    const loading = Vue.ref(false);
    const form = Vue.reactive({ username: '', password: '' });
    const rules = {
      username: [{ required: true, message: t('auth.enterUsername'), trigger: 'blur' }],
      password: [{ required: true, message: t('auth.enterPassword'), trigger: 'blur' }],
    };

    const handleLogin = async () => {
      try {
        await formRef.value.validate();
      } catch { return; }
      loading.value = true;
      try {
        const res = await authApi.login(form);
        setAuth(res.access_token, res.user);
        ElementPlus.ElMessage.success(t('auth.loginSuccess'));
        window.location.hash = '#/dashboard';
        window.location.reload();
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, handleLogin, t };
  }
};

const RegisterPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.createAccount') }}</h2>
      <p class="subtitle">{{ t('auth.registerSubtitle') }}</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="form.username" :placeholder="t('auth.username')" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" :placeholder="t('auth.email')" size="large" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" :placeholder="t('auth.passwordMin')" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" :placeholder="t('auth.confirmPassword')" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.full_name" :placeholder="t('auth.fullNameOptional')" size="large" prefix-icon="Postcard" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.phone" :placeholder="t('auth.phoneOptional')" size="large" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleRegister">{{ t('auth.register') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="switch-link">
        {{ t('auth.hasAccount') }}<a @click="$router.push('/login')">{{ t('auth.loginNow') }}</a>
      </div>
    </div>
  </div>
  `,
  setup() {
    const formRef = Vue.ref(null);
    const loading = Vue.ref(false);
    const form = Vue.reactive({ username: '', email: '', password: '', confirmPassword: '', full_name: '', phone: '' });
    const rules = {
      username: [{ required: true, message: t('auth.enterUsername'), trigger: 'blur' }, { min: 3, message: t('auth.min3chars'), trigger: 'blur' }],
      email: [{ required: true, message: t('auth.enterEmail'), trigger: 'blur' }, { type: 'email', message: t('auth.invalidEmail'), trigger: 'blur' }],
      password: [{ required: true, message: t('auth.enterPassword'), trigger: 'blur' }, { min: 6, message: t('auth.min6chars'), trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: t('auth.confirmPasswordRequired'), trigger: 'blur' },
        { validator: (rule, val, cb) => val === form.password ? cb() : cb(new Error(t('auth.passwordMismatch'))), trigger: 'blur' }
      ],
    };

    const handleRegister = async () => {
      try { await formRef.value.validate(); } catch { return; }
      loading.value = true;
      try {
        await authApi.register({
          username: form.username,
          email: form.email,
          password: form.password,
          full_name: form.full_name || null,
          phone: form.phone || null,
        });
        ElementPlus.ElMessage.success(t('auth.registerSuccess'));
        window.location.hash = '#/login';
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, handleRegister, t };
  }
};
