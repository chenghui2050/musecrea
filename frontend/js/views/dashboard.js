// Dashboard View
const DashboardPage = {
  template: `
  <div>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--eval"><svg width="36" height="36" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect x="6" y="3" width="24" height="3" fill="#f7d51d"/><rect x="6" y="6" width="3" height="3" fill="#f7d51d"/><rect x="27" y="6" width="3" height="3" fill="#f7d51d"/><rect x="6" y="9" width="3" height="3" fill="#f7d51d"/><rect x="27" y="9" width="3" height="3" fill="#f7d51d"/><rect x="6" y="12" width="3" height="3" fill="#f7d51d"/><rect x="12" y="12" width="12" height="3" fill="#f7d51d"/><rect x="27" y="12" width="3" height="3" fill="#f7d51d"/><rect x="6" y="15" width="3" height="3" fill="#f7d51d"/><rect x="27" y="15" width="3" height="3" fill="#f7d51d"/><rect x="6" y="18" width="3" height="3" fill="#f7d51d"/><rect x="12" y="18" width="12" height="3" fill="#f7d51d"/><rect x="27" y="18" width="3" height="3" fill="#f7d51d"/><rect x="6" y="21" width="3" height="3" fill="#f7d51d"/><rect x="27" y="21" width="3" height="3" fill="#f7d51d"/><rect x="6" y="24" width="3" height="3" fill="#f7d51d"/><rect x="12" y="24" width="12" height="3" fill="#f7d51d"/><rect x="27" y="24" width="3" height="3" fill="#f7d51d"/><rect x="6" y="27" width="3" height="3" fill="#f7d51d"/><rect x="27" y="27" width="3" height="3" fill="#f7d51d"/><rect x="6" y="30" width="24" height="3" fill="#f7d51d"/></svg></div>
        <div class="stat-info">
          <h3>{{ stats.totalEvaluations }}</h3>
          <p>{{ t('dash.totalEvals') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--score"><svg width="36" height="36" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect x="15" y="3" width="6" height="3" fill="#f7d51d"/><rect x="15" y="6" width="6" height="3" fill="#f7d51d"/><rect x="9" y="9" width="18" height="3" fill="#f7d51d"/><rect x="6" y="12" width="24" height="3" fill="#f7d51d"/><rect x="9" y="15" width="18" height="3" fill="#f7d51d"/><rect x="12" y="18" width="12" height="3" fill="#f7d51d"/><rect x="9" y="21" width="3" height="3" fill="#f7d51d"/><rect x="24" y="21" width="3" height="3" fill="#f7d51d"/><rect x="6" y="24" width="3" height="3" fill="#f7d51d"/><rect x="27" y="24" width="3" height="3" fill="#f7d51d"/></svg></div>
        <div class="stat-info">
          <h3>{{ stats.avgScore || '--' }}</h3>
          <p>{{ t('dash.avgScore') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--credits"><svg width="36" height="36" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect x="18" y="3" width="12" height="3" fill="#f7d51d"/><rect x="15" y="6" width="12" height="3" fill="#f7d51d"/><rect x="12" y="9" width="12" height="3" fill="#f7d51d"/><rect x="9" y="12" width="12" height="3" fill="#f7d51d"/><rect x="6" y="15" width="24" height="3" fill="#f7d51d"/><rect x="15" y="18" width="12" height="3" fill="#f7d51d"/><rect x="12" y="21" width="12" height="3" fill="#f7d51d"/><rect x="9" y="24" width="12" height="3" fill="#f7d51d"/><rect x="6" y="27" width="12" height="3" fill="#f7d51d"/></svg></div>
        <div class="stat-info">
          <h3>{{ user?.credits || 0 }}</h3>
          <p>{{ t('dash.remaining') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--products"><svg width="36" height="36" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect x="6" y="3" width="12" height="3" fill="#f7d51d"/><rect x="21" y="3" width="12" height="3" fill="#f7d51d"/><rect x="6" y="6" width="12" height="3" fill="#f7d51d"/><rect x="21" y="6" width="12" height="3" fill="#f7d51d"/><rect x="6" y="9" width="12" height="3" fill="#f7d51d"/><rect x="21" y="9" width="12" height="3" fill="#f7d51d"/><rect x="6" y="12" width="12" height="3" fill="#f7d51d"/><rect x="21" y="12" width="12" height="3" fill="#f7d51d"/><rect x="6" y="18" width="12" height="3" fill="#f7d51d"/><rect x="21" y="18" width="12" height="3" fill="#f7d51d"/><rect x="6" y="21" width="12" height="3" fill="#f7d51d"/><rect x="21" y="21" width="12" height="3" fill="#f7d51d"/><rect x="6" y="24" width="12" height="3" fill="#f7d51d"/><rect x="21" y="24" width="12" height="3" fill="#f7d51d"/><rect x="6" y="27" width="12" height="3" fill="#f7d51d"/><rect x="21" y="27" width="12" height="3" fill="#f7d51d"/></svg></div>
        <div class="stat-info">
          <h3>{{ stats.totalProducts }}</h3>
          <p>{{ t('dash.totalProducts') }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-two-col">
      <div class="section-card">
        <h2><span class="px-icon px-rocket"></span> {{ t('dash.quickStart') }}</h2>
        <p class="text-light" style="margin-bottom:20px;font-size:14px">{{ t('dash.quickStartDesc') }}</p>
        <el-button type="primary" size="large" @click="$router.push('/upload')" style="width:100%">
          <span class="px-icon px-upload"></span> {{ t('dash.uploadStart') }}
        </el-button>
        <div style="margin-top:16px;display:flex;gap:10px;">
          <el-button @click="$router.push('/history')" style="flex:1"><span class="px-icon px-clip"></span> {{ t('dash.viewHistory') }}</el-button>
          <el-button @click="showCouponDialog = true" style="flex:1"><span class="px-icon px-ticket"></span> {{ t('dash.redeemCoupon') }}</el-button>
        </div>
      </div>

      <div class="section-card">
        <h2><span class="px-icon px-chartup"></span> {{ t('dash.recentEvals') }}</h2>
        <div v-if="recentEvals.length === 0" class="text-muted" style="text-align:center;padding:30px">{{ t('dash.noRecords') }}</div>
        <div v-for="e in recentEvals" :key="e.id" class="history-item" @click="$router.push('/results/' + e.id)">
          <span class="h-product">{{ e.product_id }}</span>
          <span class="h-score">{{ e.creativity_score?.toFixed(2) }}</span>
          <span class="h-dims">{{ e.dimension_ranking?.slice(0,3).join(' > ') }}</span>
          <span class="h-date">{{ formatDate(e.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- 券码兑换弹窗 -->
    <el-dialog v-model="showCouponDialog" :title="t('dash.redeemTitle')" width="400px">
      <el-input v-model="couponCode" :placeholder="t('dash.enterCoupon')" size="large" />
      <template #footer>
        <el-button @click="showCouponDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="couponLoading" @click="redeemCoupon">{{ t('dash.redeem') }}</el-button>
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
      const locale = (typeof MuseCreaI18n !== 'undefined' && MuseCreaI18n.lang === 'en') ? 'en-US' : 'zh-CN';
      return new Date(d).toLocaleDateString(locale);
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

    return { t, user, stats, recentEvals, showCouponDialog, couponCode, couponLoading, formatDate, redeemCoupon };
  }
};
