// Admin View
const AdminPage = {
  template: `
  <div>
    <!-- Stats Overview -->
    <div class="admin-stat-grid">
      <div class="admin-stat">
        <div class="value">{{ stats.total_users || 0 }}</div>
        <div class="label">注册用户总数</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.total_evaluations || 0 }}</div>
        <div class="label">累计评价次数</div>
      </div>
      <div class="admin-stat">
        <div class="value">¥{{ (stats.total_revenue || 0).toFixed(2) }}</div>
        <div class="label">累计收入</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.api_calls_today || 0 }}</div>
        <div class="label">今日API调用</div>
      </div>
      <div class="admin-stat">
        <div class="value">{{ stats.active_users_today || 0 }}</div>
        <div class="label">今日活跃用户</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="section-card">
      <el-tabs v-model="activeTab">
        <!-- Users Tab -->
        <el-tab-pane label="用户管理" name="users">
          <el-table :data="users" stripe style="width:100%">
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="email" label="邮箱" width="180" />
            <el-table-column prop="full_name" label="姓名" width="100" />
            <el-table-column prop="role" label="角色" width="80">
              <template #default="{ row }">
                <el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="credits" label="积分" width="80" />
            <el-table-column prop="evaluation_count" label="评价次数" width="90" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
                  {{ row.is_active ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link size="small" :type="row.is_active ? 'danger' : 'success'" @click="toggleUser(row)">
                  {{ row.is_active ? '禁用' : '启用' }}
                </el-button>
                <el-button link size="small" type="primary" @click="editCredits(row)">调整积分</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- API Logs Tab -->
        <el-tab-pane label="API调用日志" name="logs">
          <el-table :data="logs" stripe style="width:100%">
            <el-table-column prop="user" label="用户" width="120" />
            <el-table-column prop="product_id" label="产品ID" width="100" />
            <el-table-column label="创意值" width="100">
              <template #default="{ row }">
                <span style="font-weight:600;color:#667eea;">{{ row.creativity_score?.toFixed(4) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="sample_count" label="样本数" width="80" />
            <el-table-column label="LLM分析" width="80">
              <template #default="{ row }">
                <el-tag :type="row.has_llm ? 'success' : 'info'" size="small">{{ row.has_llm ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="160">
              <template #default="{ row }">
                <span style="font-size:12px;">{{ row.created_at }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Coupons Tab -->
        <el-tab-pane label="券码管理" name="coupons">
          <div style="margin-bottom:16px;display:flex;justify-content:space-between;">
            <h3 style="font-size:16px">优惠券列表</h3>
            <el-button type="primary" @click="showCouponDialog = true">+ 创建券码</el-button>
          </div>
          <el-table :data="coupons" stripe style="width:100%">
            <el-table-column prop="code" label="券码" width="160" />
            <el-table-column prop="discount_type" label="类型" width="140" />
            <el-table-column prop="credits_value" label="赠送次数" width="90" />
            <el-table-column label="使用次数" width="100">
              <template #default="{ row }">{{ row.used_count }} / {{ row.max_uses }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'info'" size="small">{{ row.is_active ? '有效' : '已用完' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link size="small" type="danger" @click="deleteCoupon(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Create Coupon Dialog -->
    <el-dialog v-model="showCouponDialog" title="创建优惠券码" width="450px">
      <el-form :model="newCoupon" label-width="100px">
        <el-form-item label="券码">
          <el-input v-model="newCoupon.code" placeholder="如：MUSECREA2025" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="newCoupon.discount_type" style="width:100%">
            <el-option label="免费评价" value="free_evaluation" />
            <el-option label="折扣百分比" value="discount_percent" />
            <el-option label="免费订阅" value="free_subscription" />
          </el-select>
        </el-form-item>
        <el-form-item label="赠送次数">
          <el-input-number v-model="newCoupon.credits_value" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="最大使用次数">
          <el-input-number v-model="newCoupon.max_uses" :min="1" :max="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCouponDialog = false">取消</el-button>
        <el-button type="primary" :loading="couponLoading" @click="createCoupon">创建</el-button>
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
        ElementPlus.ElMessage.error('加载管理数据失败: ' + e.message);
      }
    });

    const toggleUser = async (user) => {
      try {
        await adminApi.toggleUser(user.id);
        user.is_active = !user.is_active;
        ElementPlus.ElMessage.success(user.is_active ? '已启用' : '已禁用');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
    };

    const editCredits = async (user) => {
      ElementPlus.ElMessageBox.prompt('请输入新的积分数量', '调整积分', {
        inputValue: String(user.credits),
        inputPattern: /^\d+$/,
        inputErrorMessage: '请输入有效数字',
      }).then(async ({ value }) => {
        try {
          await adminApi.updateCredits(user.id, parseInt(value));
          user.credits = parseInt(value);
          ElementPlus.ElMessage.success('积分已更新');
        } catch (e) { ElementPlus.ElMessage.error(e.message); }
      }).catch(() => {});
    };

    const createCoupon = async () => {
      couponLoading.value = true;
      try {
        const res = await adminApi.createCoupon(newCoupon);
        coupons.value.unshift(res);
        showCouponDialog.value = false;
        ElementPlus.ElMessage.success('券码创建成功');
      } catch (e) { ElementPlus.ElMessage.error(e.message); }
      finally { couponLoading.value = false; }
    };

    const deleteCoupon = async (coupon) => {
      try {
        await ElementPlus.ElMessageBox.confirm('确定删除此券码？');
        await adminApi.deleteCoupon(coupon.id);
        coupons.value = coupons.value.filter(c => c.id !== coupon.id);
        ElementPlus.ElMessage.success('已删除');
      } catch (e) { if (e !== 'cancel') ElementPlus.ElMessage.error(e.message); }
    };

    return { stats, users, logs, coupons, activeTab, showCouponDialog, couponLoading, newCoupon, toggleUser, editCredits, createCoupon, deleteCoupon };
  }
};
