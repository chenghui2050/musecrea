// Admin View
const AdminPage = {
  template: `
  <div>
    <!-- Stats Overview -->
    <div class="admin-stat-grid">
      <div class="admin-stat">
        <div class="value">{{ stats.total_users || 0 }}</div>
        <div class="label">{{ t('admin.totalUsers') }}</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.total_evaluations || 0 }}</div>
        <div class="label">{{ t('admin.totalEvals') }}</div>
      </div>
      <div class="admin-stat">
        <div class="value">¥{{ (stats.total_revenue || 0).toFixed(2) }}</div>
        <div class="label">{{ t('admin.totalRevenue') }}</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.api_calls_today || 0 }}</div>
        <div class="label">{{ t('admin.todayApi') }}</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.active_users_today || 0 }}</div>
        <div class="label">{{ t('admin.todayActive') }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="section-card">
      <el-tabs v-model="activeTab">
        <!-- Users Tab -->
        <el-tab-pane :label="t('admin.userMgmt')" name="users">
          <el-table :data="users" stripe style="width:100%">
            <el-table-column prop="username" :label="t('admin.username')" width="120" />
            <el-table-column prop="email" :label="t('admin.email')" width="180" />
            <el-table-column prop="full_name" :label="t('admin.fullName')" width="100" />
            <el-table-column prop="role" :label="t('admin.role')" width="80">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="credits" :label="t('admin.credits')" width="100" />
            <el-table-column prop="evaluation_count" :label="t('admin.evalCount')" width="120" />
            <el-table-column :label="t('admin.status')" width="110">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                  {{ row.is_active ? t('admin.statusActive') : t('admin.statusDisabled') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('admin.actions')" width="260" fixed="right">
              <template #default="{ row }">
                <el-button link size="small" :type="row.is_active ? 'danger' : 'success'" @click="toggleUser(row)">
                  {{ row.is_active ? t('admin.disable') : t('admin.enable') }}
                </el-button>
                <el-button link size="small" type="primary" @click="editCredits(row)">{{ t('admin.adjustCredits') }}</el-button>
                <el-button link size="small" type="warning" @click="resetPassword(row)">{{ t('admin.resetPwd') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- API Logs Tab -->
        <el-tab-pane :label="t('admin.apiLogs')" name="logs">
          <el-table :data="logs" stripe style="width:100%">
            <el-table-column prop="user" :label="t('admin.user')" width="120" />
            <el-table-column prop="product_id" :label="t('admin.productId')" width="100" />
            <el-table-column :label="t('admin.creativity')" width="100">
              <template #default="{ row }">
                <span class="score-highlight">{{ row.creativity_score?.toFixed(4) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sample_count" :label="t('admin.sampleCount')" width="80" />
            <el-table-column :label="t('admin.llmAnalysis')" width="80">
              <template #default="{ row }">
                <el-tag :type="row.has_llm ? 'success' : 'info'" size="small">{{ row.has_llm ? t('admin.yes') : t('admin.no') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('admin.time')" width="160">
              <template #default="{ row }">
                <span style="font-size:12px;">{{ row.created_at }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Coupons Tab -->
        <el-tab-pane :label="t('admin.couponMgmt')" name="coupons">
          <div style="margin-bottom:16px;display:flex;justify-content:space-between;">
            <h3 style="font-size:16px">{{ t('admin.couponList') }}</h3>
            <el-button type="primary" @click="showCouponDialog = true">{{ t('admin.createCoupon') }}</el-button>
          </div>
          <el-table :data="coupons" stripe style="width:100%">
            <el-table-column prop="code" :label="t('admin.couponCode')" width="160" />
            <el-table-column prop="discount_type" :label="t('admin.type')" width="140" />
            <el-table-column prop="credits_value" :label="t('admin.creditsValue')" width="90" />
            <el-table-column :label="t('admin.useCount')" width="100">
              <template #default="{ row }">{{ row.used_count }} / {{ row.max_uses }}</template>
            </el-table-column>
            <el-table-column :label="t('admin.status')" width="110">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'info'" size="small">{{ row.is_active ? t('admin.couponValid') : t('admin.couponUsedUp') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('admin.actions')" width="120">
              <template #default="{ row }">
                <el-button link size="small" type="danger" @click="deleteCoupon(row)">{{ t('admin.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Create Coupon Dialog -->
    <el-dialog v-model="showCouponDialog" :title="t('admin.createCouponTitle')" width="450px">
      <el-form :model="newCoupon" label-width="100px">
        <el-form-item :label="t('admin.couponCode')">
          <el-input v-model="newCoupon.code" :placeholder="t('admin.couponCodePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('admin.type')">
          <el-select v-model="newCoupon.discount_type" style="width:100%">
            <el-option :label="t('admin.freeEval')" value="free_evaluation" />
            <el-option :label="t('admin.discountPercent')" value="discount_percent" />
            <el-option :label="t('admin.freeSubscription')" value="free_subscription" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('admin.creditsValue')">
          <el-input-number v-model="newCoupon.credits_value" :min="1" :max="100" />
        </el-form-item>
        <el-form-item :label="t('admin.maxUses')">
          <el-input-number v-model="newCoupon.max_uses" :min="1" :max="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCouponDialog = false">{{ t('admin.cancel') }}</el-button>
        <el-button type="primary" :loading="couponLoading" @click="createCoupon">{{ t('admin.create') }}</el-button>
      </template>
    </el-dialog>
  </div>
  `,
  setup() {
    const stats = Vue.ref({});
    const users = Vue.ref([]);
    const logs = Vue.ref([]);
    const coupons = Vue.ref([]);
    const activeTab = Vue.ref('users');
    const showCouponDialog = Vue.ref(false);
    const couponLoading = Vue.ref(false);
    const newCoupon = Vue.reactive({
      code: '', discount_type: 'free_evaluation', credits_value: 5, max_uses: 1,
    });

    Vue.onMounted(async () => {
      try {
        stats.value = await adminApi.getStats();
        const usersRes = await adminApi.getUsers(1);
        users.value = usersRes.users;
        const logsRes = await adminApi.getApiLogs(1);
        logs.value = logsRes.logs;
        const couponsRes = await adminApi.getCoupons(1);
        coupons.value = couponsRes.coupons;
      } catch (e) {
        ElementPlus.ElMessage.error(t('admin.loadFailed') + ': ' + e.message);
      }
    });

    const toggleUser = async (user) => {
      try {
        await adminApi.toggleUser(user.id);
        user.is_active = !user.is_active;
        ElementPlus.ElMessage.success(user.is_active ? t('admin.enabled') : t('admin.disabled'));
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    };

    const editCredits = async (user) => {
      ElementPlus.ElMessageBox.prompt(t('admin.enterNewCredits'), t('admin.adjustCredits'), {
        inputValue: String(user.credits),
        inputPattern: /^\d+$/,
        inputErrorMessage: t('admin.invalidNumber'),
      }).then(async ({ value }) => {
        try {
          await adminApi.updateCredits(user.id, parseInt(value));
          user.credits = parseInt(value);
          ElementPlus.ElMessage.success(t('admin.creditsUpdated'));
        } catch (e) { ElementPlus.ElMessage.error(e.message); }
      }).catch(() => {});
    };

    const resetPassword = async (user) => {
      ElementPlus.ElMessageBox.prompt(t('admin.enterNewPassword'), t('admin.resetPwdTitle') + ' - ' + user.username, {
        inputValue: 'MuseCrea123',
        inputPattern: /^.{6,}$/,
        inputErrorMessage: t('admin.passwordMinError'),
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      }).then(async ({ value }) => {
        try {
          await adminApi.resetPassword(user.id, value);
          ElementPlus.ElMessage.success(t('admin.passwordResetOk'));
        } catch (e) { ElementPlus.ElMessage.error(e.message); }
      }).catch(() => {});
    };

    const createCoupon = async () => {
      couponLoading.value = true;
      try {
        const res = await adminApi.createCoupon(newCoupon);
        coupons.value.unshift(res);
        showCouponDialog.value = false;
        ElementPlus.ElMessage.success(t('admin.couponCreated'));
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { couponLoading.value = false; }
    };

    const deleteCoupon = async (coupon) => {
      try {
        await ElementPlus.ElMessageBox.confirm(t('admin.confirmDeleteCoupon'));
        await adminApi.deleteCoupon(coupon.id);
        coupons.value = coupons.value.filter(c => c.id !== coupon.id);
        ElementPlus.ElMessage.success(t('admin.deleted'));
      } catch (e) { if (e !== 'cancel') ElementPlus.ElMessage.error(e.message); }
    };

    return { stats, users, logs, coupons, activeTab, showCouponDialog, couponLoading, newCoupon, toggleUser, editCredits, resetPassword, createCoupon, deleteCoupon, t };
  }
};
