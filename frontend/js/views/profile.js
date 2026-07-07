// Profile View
const ProfilePage = {
  template: `
  <div>
    <div class="section-card" style="max-width:600px;margin:0 auto;">
      <h2>👤 个人信息</h2>
      <el-form :model="form" label-width="100px" style="margin-top:24px;">
        <el-form-item label="用户名">
          <el-input :value="user?.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input :value="user?.email" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-tag :type="user?.role === 'admin' ? 'danger' : 'info'">{{ user?.role === 'admin' ? '管理员' : '普通用户' }}</el-tag>
        </el-form-item>
        <el-form-item label="剩余积分">
          <span style="font-size:20px;font-weight:700;color:#667eea;">{{ user?.credits || 0 }}</span>
          <span class="text-light" style="margin-left:8px;font-size:13px;">次评价机会</span>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.full_name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveProfile">保存修改</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <h3 style="margin-bottom:16px;">📊 账户统计</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="注册时间">{{ formatDate(user?.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="user?.is_active ? 'success' : 'danger'" size="small">{{ user?.is_active ? '正常' : '禁用' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3 style="margin-bottom:16px;">🔑 兑换优惠券</h3>
      <div style="display:flex;gap:10px;">
        <el-input v-model="couponCode" placeholder="请输入券码" />
        <el-button type="primary" :loading="couponLoading" @click="redeemCoupon">兑换</el-button>
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
        ElementPlus.ElMessage.success('保存成功');
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

    return { user, form, saving, couponCode, couponLoading, saveProfile, redeemCoupon, formatDate };
  }
};
