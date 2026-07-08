// Profile View
const ProfilePage = {
  template: `
  <div>
    <div class="section-card" style="max-width:600px;margin:0 auto;">
      <h2>{{ t('profile.title') }}</h2>
      <el-form :model="form" label-width="100px" style="margin-top:24px;">
        <el-form-item :label="t('profile.username')">
          <el-input :value="user?.username" disabled />
        </el-form-item>
        <el-form-item :label="t('profile.email')">
          <el-input :value="user?.email" disabled />
        </el-form-item>
        <el-form-item :label="t('profile.role')">
          <el-tag :type="user?.role === 'admin' ? 'danger' : 'info'">{{ user?.role === 'admin' ? t('profile.admin') : t('profile.user') }}</el-tag>
        </el-form-item>
        <el-form-item :label="t('profile.remainingCredits')">
          <span style="font-size:20px;font-weight:700;color:#667eea;">{{ user?.credits || 0 }}</span>
          <span class="text-light" style="margin-left:8px;font-size:13px;">{{ t('profile.evalOpportunities') }}</span>
        </el-form-item>
        <el-form-item :label="t('profile.fullName')">
          <el-input v-model="form.full_name" :placeholder="t('profile.fullNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('profile.phone')">
          <el-input v-model="form.phone" :placeholder="t('profile.phonePlaceholder')" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveProfile">{{ t('profile.saveChanges') }}</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <h3 style="margin-bottom:16px;">{{ t('profile.accountStats') }}</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="t('profile.joinDate')">{{ formatDate(user?.created_at) }}</el-descriptions-item>
        <el-descriptions-item :label="t('profile.accountStatus')">
          <el-tag :type="user?.is_active ? 'success' : 'danger'" size="small">{{ user?.is_active ? t('profile.statusActive') : t('profile.statusDisabled') }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3 style="margin-bottom:16px;">{{ t('profile.redeemCoupon') }}</h3>
      <div style="display:flex;gap:10px;">
        <el-input v-model="couponCode" :placeholder="t('profile.couponPlaceholder')" />
        <el-button type="primary" :loading="couponLoading" @click="redeemCoupon">{{ t('profile.redeem') }}</el-button>
      </div>
    </div>
  </div>
  `,
  setup() {
    const user = Vue.ref(getUser());
    const saving = Vue.ref(false);
    const couponCode = Vue.ref('');
    const couponLoading = Vue.ref(false);
    const form = Vue.reactive({ full_name: user.value?.full_name || '', phone: user.value?.phone || '' });

    const saveProfile = async () => {
      saving.value = true;
      try {
        const updated = await authApi.updateMe(form);
        user.value = updated;
        localStorage.setItem('musecrea_user', JSON.stringify(updated));
        ElementPlus.ElMessage.success(t('profile.saveSuccess'));
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        saving.value = false;
      }
    };

    const redeemCoupon = async () => {
      if (!couponCode.value.trim()) return;
      couponLoading.value = true;
      try {
        const res = await billingApi.redeemCoupon(couponCode.value.trim());
        ElementPlus.ElMessage.success(res.message);
        const updated = await authApi.getMe();
        user.value = updated;
        localStorage.setItem('musecrea_user', JSON.stringify(updated));
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        couponLoading.value = false;
      }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '';

    return { user, form, saving, couponCode, couponLoading, saveProfile, redeemCoupon, formatDate, t };
  }
};
