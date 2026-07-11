// History View
const HistoryPage = {
  template: `
  <div>
    <div class="section-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <h2><span class="px-icon px-clip"></span> {{ t('hist.title') }}</h2>
          <p class="text-light" style="margin-top:4px">{{ t('hist.desc') }}</p>
        </div>
        <el-button type="primary" plain @click="openImageLibrary(null)"><span style="display:inline-flex;align-items:center;gap:6px"><svg width="24" height="24" viewBox="0 0 36 36" shape-rendering="crispEdges"><rect x="12" y="3" width="12" height="3" fill="#f7d51d"/><rect x="6" y="6" width="24" height="3" fill="#f7d51d"/><rect x="6" y="9" width="9" height="3" fill="#f7d51d"/><rect x="21" y="9" width="9" height="3" fill="#f7d51d"/><rect x="6" y="12" width="9" height="3" fill="#f7d51d"/><rect x="21" y="12" width="9" height="3" fill="#f7d51d"/><rect x="6" y="15" width="9" height="3" fill="#f7d51d"/><rect x="21" y="15" width="9" height="3" fill="#f7d51d"/><rect x="6" y="18" width="24" height="3" fill="#f7d51d"/></svg><span>{{ t('hist.manageImages') }}</span></span></el-button>
      </div>

      <div v-if="loading" style="text-align:center;padding:40px">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-if="!loading && records.length === 0" class="text-center" style="padding:40px">
        <div style="font-size:48px;margin-bottom:16px"><span class="px-icon px-icon-xl px-empty"></span></div>
        <p class="text-light">{{ t('hist.noRecords') }}</p>
        <el-button type="primary" style="margin-top:16px" @click="$router.push('/upload')">{{ t('hist.firstEval') }}</el-button>
      </div>

      <div v-if="!loading && records.length > 0">
        <!-- Table -->
        <el-table :data="records" stripe style="width:100%" @row-click="viewDetail" :row-style="{cursor:'pointer'}">
          <el-table-column :label="t('hist.product')" width="100">
            <template #default="{ row }">
              <div v-if="row.product_image" class="hist-thumb" @click.stop="openImageLibrary(row.product_id)">
                <img :src="row.product_image" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div v-else class="hist-thumb hist-thumb--placeholder" @click.stop="openImageLibrary(row.product_id)" :title="t('hist.clickUpload')"><span class="px-icon px-museum"></span></div>
            </template>
          </el-table-column>
          <el-table-column prop="product_id" :label="t('hist.productId')" width="130" />
          <el-table-column :label="t('hist.creativityScore')" width="110">
            <template #default="{ row }">
              <span class="score-highlight">{{ row.creativity_score?.toFixed(4) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('hist.dimRanking')" min-width="250">
            <template #default="{ row }">
              <span class="text-light" style="font-size:13px;">{{ row.dimension_ranking?.join(' > ') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('hist.sampleCount')" width="100" prop="sample_count" />
          <el-table-column :label="t('hist.aiAnalysis')" width="120">
            <template #default="{ row }">
              <el-tag :type="row.has_llm_analysis ? 'success' : 'info'" size="small">
                {{ row.has_llm_analysis ? t('hist.hasAi') : t('hist.noAi') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('hist.date')" width="120">
            <template #default="{ row }">
              <span class="text-muted" style="font-size:12px;">{{ formatDate(row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('hist.actions')" width="220" fixed="right">
            <template #default="{ row }">
              <div style="display:flex;align-items:center;gap:4px;">
                <el-button type="primary" link size="small" @click.stop="viewDetail(row)">{{ t('hist.detail') }}</el-button>
                <el-button type="primary" link size="small" @click.stop="viewReport(row)">{{ t('hist.report') }}</el-button>
                <el-button type="primary" link size="small" @click.stop="openImageLibrary(row.product_id)"><span style="display:inline-flex;align-items:center;gap:6px;line-height:1"><svg width="24" height="24" viewBox="0 0 36 36" shape-rendering="crispEdges" style="display:block;flex-shrink:0"><rect x="12" y="3" width="12" height="3" fill="#f7d51d"/><rect x="6" y="6" width="24" height="3" fill="#f7d51d"/><rect x="6" y="9" width="9" height="3" fill="#f7d51d"/><rect x="21" y="9" width="9" height="3" fill="#f7d51d"/><rect x="6" y="12" width="9" height="3" fill="#f7d51d"/><rect x="21" y="12" width="9" height="3" fill="#f7d51d"/><rect x="6" y="15" width="9" height="3" fill="#f7d51d"/><rect x="21" y="15" width="9" height="3" fill="#f7d51d"/><rect x="6" y="18" width="24" height="3" fill="#f7d51d"/></svg><span style="line-height:1">{{ t('hist.images') }}</span></span></el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div style="text-align:center;margin-top:20px;">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="20"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadHistory"
          />
        </div>
      </div>
    </div>

    <!-- Image Library Modal -->
    <image-library-modal
      v-model="showImageLibrary"
      :target-product-id="imageLibraryTargetProduct"
      @refresh="loadHistory(currentPage)"
      @assigned="onImageAssigned"
    />
  </div>
  `,
  setup() {
    const router = VueRouter.useRouter();
    const records = Vue.ref([]);
    const loading = Vue.ref(true);
    const currentPage = Vue.ref(1);
    const total = Vue.ref(0);
    const showImageLibrary = Vue.ref(false);
    const imageLibraryTargetProduct = Vue.ref(null);

    const loadHistory = async (page) => {
      loading.value = true;
      try {
        // 同时获取历史记录和产品图片映射
        const [res, imgResp] = await Promise.all([
          evalApi.getHistory(page || currentPage.value),
          uploadApi.getProductImages().catch(() => ({ images: {} })),
        ]);
        const imageMap = (imgResp && imgResp.images) || {};
        const ts = Date.now();
        // 填充产品图片，添加时间戳防止浏览器缓存旧图
        res.results.forEach(r => {
          if (r.product_image) {
            r.product_image = r.product_image + '?t=' + ts;
          } else if (imageMap[r.product_id]) {
            r.product_image = imageMap[r.product_id] + '?t=' + ts;
          }
        });
        records.value = res.results;
        total.value = res.total;
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }
    };

    Vue.onMounted(() => loadHistory(1));

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '';

    const viewDetail = (row) => {
      router.push('/results/' + row.id);
    };

    const viewReport = (row) => {
      router.push('/report/' + row.id);
    };

    const openImageLibrary = (productId) => {
      imageLibraryTargetProduct.value = productId;
      showImageLibrary.value = true;
    };

    const onImageAssigned = () => {
      loadHistory(currentPage.value);
    };

    return { t, records, loading, currentPage, total, loadHistory, formatDate, viewDetail, viewReport, showImageLibrary, imageLibraryTargetProduct, openImageLibrary, onImageAssigned };
  }
};
