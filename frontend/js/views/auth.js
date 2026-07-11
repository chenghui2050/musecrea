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
        <el-form-item style="margin-bottom:8px">
          <el-checkbox v-model="rememberPwd">{{ t('auth.rememberPwd') }}</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleLogin">{{ t('auth.login') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="switch-link" style="margin-top:4px">
        <a @click="$router.push('/forgot-password')">{{ t('auth.forgotPassword') }}</a>
      </div>
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
    const rememberPwd = Vue.ref(false);
    const form = Vue.reactive({ username: '', password: '' });
    const rules = {
      username: [{ required: true, message: t('auth.enterUsername'), trigger: 'blur' }],
      password: [{ required: true, message: t('auth.enterPassword'), trigger: 'blur' }],
    };

    // Auto-fill saved credentials
    Vue.onMounted(() => {
      const saved = localStorage.getItem('musecrea_remember');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          form.username = data.username || '';
          form.password = atob(data.pw) || '';
          rememberPwd.value = true;
        } catch (e) { /* ignore */ }
      }
    });

    const handleLogin = async () => {
      try {
        await formRef.value.validate();
      } catch { return; }
      loading.value = true;
      try {
        const res = await authApi.login(form);
        setAuth(res.access_token, res.user);
        // Save or clear remembered credentials
        if (rememberPwd.value) {
          localStorage.setItem('musecrea_remember', JSON.stringify({
            username: form.username,
            pw: btoa(form.password),
          }));
        } else {
          localStorage.removeItem('musecrea_remember');
        }
        ElementPlus.ElMessage.success(t('auth.loginSuccess'));
        window.location.hash = '#/dashboard';
        window.location.reload();
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, rememberPwd, handleLogin, t };
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

// Forgot Password Page
const ForgotPasswordPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.forgotPasswordTitle') }}</h2>
      <p class="subtitle">{{ t('auth.forgotPasswordDesc') }}</p>
      <div v-if="!sent">
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item prop="email">
            <el-input v-model="form.email" :placeholder="t('auth.email')" size="large" prefix-icon="Message" @keyup.enter="handleSubmit" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleSubmit">{{ t('auth.sendResetLink') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else style="text-align:center;padding:20px 0;">
        <el-result icon="success" :title="t('auth.resetLinkSent')" :sub-title="t('auth.resetLinkSentDesc')" />
      </div>
      <div class="switch-link" style="margin-top:10px">
        <a @click="$router.push('/login')">{{ t('auth.backToLogin') }}</a>
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
    const sent = Vue.ref(false);
    const form = Vue.reactive({ email: '' });
    const rules = {
      email: [{ required: true, message: t('auth.enterEmail'), trigger: 'blur' }, { type: 'email', message: t('auth.invalidEmail'), trigger: 'blur' }],
    };

    const handleSubmit = async () => {
      try { await formRef.value.validate(); } catch { return; }
      loading.value = true;
      try {
        await authApi.forgotPassword(form.email);
        sent.value = true;
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, sent, handleSubmit, t };
  }
};

// Reset Password Page (from email link)
const ResetPasswordPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.resetPasswordTitle') }}</h2>
      <p class="subtitle">{{ t('auth.resetPasswordDesc') }}</p>
      <div v-if="!done">
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item prop="newPassword">
            <el-input v-model="form.newPassword" type="password" :placeholder="t('auth.newPassword')" size="large" prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" :placeholder="t('auth.confirmPassword')" size="large" prefix-icon="Lock" show-password @keyup.enter="handleSubmit" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleSubmit">{{ t('auth.resetPasswordBtn') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else style="text-align:center;padding:20px 0;">
        <el-result icon="success" :title="t('auth.resetSuccess')" :sub-title="t('auth.resetSuccessDesc')" />
        <el-button type="primary" @click="$router.push('/login')">{{ t('auth.goLogin') }}</el-button>
      </div>
      <div v-if="error" style="text-align:center;padding:20px 0;">
        <el-result icon="error" :title="t('auth.resetFailed')" :sub-title="error" />
        <el-button @click="$router.push('/forgot-password')">{{ t('auth.resendLink') }}</el-button>
      </div>
    </div>
  </div>
  `,
  setup() {
    const route = VueRouter.useRoute();
    const formRef = Vue.ref(null);
    const loading = Vue.ref(false);
    const done = Vue.ref(false);
    const error = Vue.ref('');
    const token = route.query.token || '';
    const form = Vue.reactive({ newPassword: '', confirmPassword: '' });
    const rules = {
      newPassword: [{ required: true, message: t('auth.enterNewPassword'), trigger: 'blur' }, { min: 6, message: t('auth.min6chars'), trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: t('auth.confirmPasswordRequired'), trigger: 'blur' },
        { validator: (rule, val, cb) => val === form.newPassword ? cb() : cb(new Error(t('auth.passwordMismatch'))), trigger: 'blur' }
      ],
    };

    if (!token) {
      error.value = t('auth.invalidResetToken');
    }

    const handleSubmit = async () => {
      if (!token) { error.value = t('auth.invalidResetToken'); return; }
      try { await formRef.value.validate(); } catch { return; }
      loading.value = true;
      try {
        await authApi.resetPassword(token, form.newPassword);
        done.value = true;
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, done, error, handleSubmit, t };
  }
};
