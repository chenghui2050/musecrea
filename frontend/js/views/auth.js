// Auth Views - Login & Register
const LoginPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>欢迎回来</h2>
      <p class="subtitle">登录 MuseCrea 文创评价系统</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleLogin">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="switch-link">
        还没有账号？<a @click="$router.push('/register')">立即注册</a>
      </div>
      <div class="switch-link" style="margin-top:10px">
        <a @click="$router.push('/')">← 返回首页</a>
      </div>
    </div>
  </div>
  `,
  setup() {
    const formRef = Vue.ref(null);
    const loading = Vue.ref(false);
    const form = Vue.reactive({ username: '', password: '' });
    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    };

    const handleLogin = async () => {
      try {
        await formRef.value.validate();
      } catch { return; }
      loading.value = true;
      try {
        const res = await authApi.login(form);
        setAuth(res.access_token, res.user);
        ElementPlus.ElMessage.success('登录成功');
        window.location.hash = '#/dashboard';
        window.location.reload();
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, handleLogin };
  }
};

const RegisterPage = {
  template: `
  <div class="auth-page">
    <div class="auth-card">
      <h2>创建账号</h2>
      <p class="subtitle">注册即可获赠 3 次免费评价机会</p>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" size="large" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.full_name" placeholder="姓名（可选）" size="large" prefix-icon="Postcard" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.phone" placeholder="手机号（可选）" size="large" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="handleRegister">注 册</el-button>
        </el-form-item>
      </el-form>
      <div class="switch-link">
        已有账号？<a @click="$router.push('/login')">立即登录</a>
      </div>
    </div>
  </div>
  `,
  setup() {
    const formRef = Vue.ref(null);
    const loading = Vue.ref(false);
    const form = Vue.reactive({ username: '', email: '', password: '', confirmPassword: '', full_name: '', phone: '' });
    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, message: '至少3个字符', trigger: 'blur' }],
      email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6个字符', trigger: 'blur' }],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: (rule, val, cb) => val === form.password ? cb() : cb(new Error('两次密码不一致')), trigger: 'blur' }
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
        ElementPlus.ElMessage.success('注册成功，请登录');
        window.location.hash = '#/login';
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    return { form, rules, formRef, loading, handleRegister };
  }
};
