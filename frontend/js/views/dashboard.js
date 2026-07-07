// Dashboard View
const DashboardPage = {
  template: `
  <div>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#f0f2ff;color:#667eea">📊</div>
        <div class="stat-info">
          <h3>{{ stats.totalEvaluations }}</h3>
          <p>累计评价次数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fff3e0;color:#e6a23c">⭐</div>
        <div class="stat-info">
          <h3>{{ stats.avgScore || '--' }}</h3>
          <p>平均创意值</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8f5e9;color:#67c23a">💰</div>
        <div class="stat-info">
          <h3>{{ user?.credits || 0 }}</h3>
          <p>剩余评价次数</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fce4ec;color:#f56c6c">📁</div>
        <div class="stat-info">
          <h3>{{ stats.totalProducts }}</h3>
          <p>评价产品数</p>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="section-card">
        <h2>🚀 快速开始</h2>
        <p style="color:#666;margin-bottom:20px;font-size:14px">上传Excel数据文件，选择产品，一键获取专业评价报告</p>
        <el-button type="primary" size="large" @click="$router.push('/upload')" style="width:100%">
          📤 上传数据并开始评价
        </el-button>
        <div style="margin-top:16px;display:flex;gap:10px;">
          <el-button @click="$router.push('/history')" style="flex:1">📋 查看历史</el-button>
          <el-button @click="showCouponDialog = true" style="flex:1">🎫 兑换券码</el-button>
        </div>
      </div>

      <div class="section-card">
        <h2>📈 最近评价</h2>
        <div v-if="recentEvals.length === 0" style="color:#999;text-align:center;padding:30px">暂无评价记录</div>
        <div v-for="e in recentEvals" :key="e.id" class="history-item" @click="$router.push('/results/' + e.id)">
          <span class="h-product">{{ e.product_id }}</span>
          <span class="h-score">{{ e.creativity_score?.toFixed(2) }}</span>
          <span class="h-dims">{{ e.dimension_ranking?.slice(0,3).join(' > ') }}</span>
          <span class="h-date">{{ formatDate(e.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 券码兑换弹窗 -->
    <el-dialog v-model="showCouponDialog" title="兑换优惠券码" width="400px">
      <el-input v-model="couponCode" placeholder="请输入券码" size="large" />
      <template #footer>
        <el-button @click="showCouponDialog = false">取消</el-button>
        <el-button type="primary" :loading="couponLoading" @click="redeemCoupon">兑换</el-button>
      </template>
    </el-dialog>
  </div>
  `,
  setup() {
    const user = Vue.ref(getUser());
    const stats = Vue.reactive({ totalEvaluations: 0, avgScore: null, totalProducts: 0 });
    const recentEvals = Vue.ref([]);
    const showCouponDialog = Vue.ref(false);
    const couponCode = Vue.ref('');
    const couponLoading = Vue.ref(false);

    Vue.onMounted(async () => {
      try {
        const hist = await evalApi.getHistory(1);
        stats.totalEvaluations = hist.total;
        recentEvals.value = hist.results.slice(0, 5);
        if (hist.results.length > 0) {
          const sum = hist.results.reduce((a, r) => a + (r.creativity_score || 0), 0);
          stats.avgScore = (sum / hist.results.length).toFixed(2);
          stats.totalProducts = new Set(hist.results.map(r => r.product_id)).size;
        }
      } catch (e) { console.error(e); }
    });

    const formatDate = (d) => {
      if (!d) return '';
      return new Date(d).toLocaleDateString('zh-CN');
    };

    const redeemCoupon = async () => {
      if (!couponCode.value.trim()) return;
      couponLoading.value = true;
      try {
        const res = await billingApi.redeemCoupon(couponCode.value.trim());
        ElementPlus.ElMessage.success(res.message);
        showCouponDialog.value = false;
        user.value = await authApi.getMe();
        localStorage.setItem('musecrea_user', JSON.stringify(user.value));
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        couponLoading.value = false;
      }
    };

    return { user, stats, recentEvals, showCouponDialog, couponCode, couponLoading, formatDate, redeemCoupon };
  }
};
