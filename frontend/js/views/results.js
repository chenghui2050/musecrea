// Results View - Display evaluation results with radar chart
const ResultsPage = {
  template: `
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2 style="font-size:22px">📊 {{ t('results.title') }}</h2>
      <div style="display:flex;gap:10px;">
        <el-button @click="$router.push('/upload')">📤 {{ t('results.newEval') }}</el-button>
        <el-button type="primary" v-if="results.length > 0" @click="downloadReport">📥 {{ t('results.downloadReport') }}</el-button>
      </div>
    </div>

    <div v-if="loading" class="section-card text-center">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-for="(r, idx) in results" :key="r.id" class="result-product-card">
      <div class="result-header">
        <div v-if="r.product_image" class="product-img" style="overflow:hidden;">
          <img :src="r.product_image" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div v-else class="product-img" style="display:flex;align-items:center;justify-content:center;font-size:36px;background:#f0f2ff;cursor:pointer;" @click="openImageLibrary(r.product_id)">🏛️</div>
        <div style="flex:1">
          <h2 style="font-size:20px;margin-bottom:8px;">{{ t('results.product') }} {{ r.product_id }}</h2>
          <p v-if="r.product_name" class="text-light">{{ r.product_name }}</p>
          <div style="margin-top:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <span class="creativity-score">{{ t('results.creativityScore') }} {{ r.creativity_score?.toFixed(4) }}</span>
            <span class="text-light" style="font-size:13px;">{{ t('results.sampleCount') }}{{ r.sample_count }}</span>
            <el-button size="small" @click="openImageLibrary(r.product_id)" style="margin-left:auto">
              📷 {{ r.product_image ? t('results.changeImage') : t('results.uploadImage') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- Dimension Bars -->
      <h3 style="font-size:15px;margin-bottom:14px;">{{ t('results.dimRanking') }}</h3>
      <div class="dimension-bars">
        <div v-for="(dim, dIdx) in getRankedDimensions(r)" :key="dim.key" class="dim-bar-row">
          <span class="dim-bar-label">{{ dim.label }}</span>
          <div class="dim-bar-track">
            <div class="dim-bar-fill" :style="{ width: (dim.score / maxScore * 100) + '%', background: dim.color }">
              {{ dim.score?.toFixed(2) }}
            </div>
          </div>
          <span class="dim-bar-value">
            <span class="rank-badge" :class="'rank-' + (dIdx+1)">{{ t('results.rankN', dim.rank) }}</span>
          </span>
        </div>
      </div>

      <!-- Radar Chart -->
      <div class="radar-container">
        <canvas :ref="'radar_' + idx" width="350" height="350"></canvas>
      </div>

      <!-- LLM Analysis -->
      <div v-if="r.llm_analysis" class="analysis-block">
        <h3>🤖 {{ t('results.aiAnalysis') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.llm_analysis)"></div>
      </div>

      <div v-if="r.improvement_suggestions" class="suggestions-block">
        <h3>💡 {{ t('results.suggestions') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.improvement_suggestions)"></div>
      </div>
    </div>

    <div v-if="!loading && results.length === 0" class="section-card text-center">
      <div style="font-size:48px;margin-bottom:16px">📭</div>
      <p class="text-light">{{ t('results.noResults') }}</p>
      <el-button type="primary" style="margin-top:16px" @click="$router.push('/upload')">{{ t('results.startEval') }}</el-button>
    </div>

    <!-- Image Library Modal -->
    <image-library-modal
      v-model="showImageLibrary"
      :target-product-id="imageLibraryTargetProduct"
      @refresh="refreshResults"
      @assigned="onImageAssigned"
    />
  </div>
  `,
  setup() {
    const route = VueRouter.useRoute();
    const results = Vue.ref([]);
    const loading = Vue.ref(true);
    const maxScore = Vue.ref(1);

    const dimConfig = [
      { key: 'Novelty', label: t('dim.novelty'), color: '#667eea' },
      { key: 'Usefulness', label: t('dim.usefulness'), color: '#764ba2' },
      { key: 'Affect', label: t('dim.affect'), color: '#f093fb' },
      { key: 'Aesthetics', label: t('dim.aesthetics'), color: '#4facfe' },
      { key: 'Cultural Values', label: t('dim.cultural'), color: '#43e97b' },
    ];

    const getRankedDimensions = (r) => {
      if (!r.dimension_scores) return dimConfig.map((d, i) => ({ ...d, score: 0, rank: i + 1 }));
      const items = dimConfig.map(d => ({ ...d, score: r.dimension_scores[d.key] || 0 }));
      items.sort((a, b) => b.score - a.score);
      return items.map((item, i) => ({ ...item, rank: i + 1 }));
    };

    const drawRadar = (canvasRef, r) => {
      if (!canvasRef || !r.dimension_scores) return;
      const ctx = canvasRef.getContext('2d');
      const scores = dimConfig.map(d => r.dimension_scores[d.key] || 0);
      const labels = dimConfig.map(d => d.label);
      const max = Math.max(...scores, 1);

      new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: t('dim.scoreLabel'),
            data: scores,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102,126,234,0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#667eea',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              max: Math.ceil(max * 1.1),
              ticks: { font: { size: 11 }, backdropColor: 'transparent' },
              pointLabels: { font: { size: 13, family: 'Microsoft YaHei' } },
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    };

    // Helper: add cache-busting to image URL
    const bustCache = (url) => {
      if (!url) return url;
      return url + '?t=' + Date.now();
    };

    const fetchResults = async () => {
      let imageMap = {};
      try {
        const imgResp = await uploadApi.getProductImages();
        imageMap = (imgResp && imgResp.images) || {};
      } catch (e) {}

      if (route.params.id) {
        const detail = await evalApi.getDetail(route.params.id);
        // Always prefer backend's product_image, fallback to imageMap
        if (detail.product_image) {
          detail.product_image = bustCache(detail.product_image);
        } else if (imageMap[detail.product_id]) {
          detail.product_image = bustCache(imageMap[detail.product_id]);
        }
        results.value = [detail];
      } else if (route.query.ids) {
        const ids = route.query.ids.split(',');
        const details = await Promise.all(ids.map(id => evalApi.getDetail(id)));
        details.forEach(d => {
          if (d.product_image) {
            d.product_image = bustCache(d.product_image);
          } else if (imageMap[d.product_id]) {
            d.product_image = bustCache(imageMap[d.product_id]);
          }
        });
        results.value = details;
      }
    };

    Vue.onMounted(async () => {
      try {
        await fetchResults();

        // Calculate max score
        let max = 1;
        results.value.forEach(r => {
          if (r.dimension_scores) {
            Object.values(r.dimension_scores).forEach(v => { if (v > max) max = v; });
          }
        });
        maxScore.value = max;
      } catch (e) {
        ElementPlus.ElMessage.error(e.message);
      } finally {
        loading.value = false;
      }

      // Draw radar charts after DOM update
      Vue.nextTick(() => {
        results.value.forEach((r, idx) => {
          const refs = Vue.getCurrentInstance()?.proxy?.$refs;
          const canvasArr = refs?.['radar_' + idx];
          if (canvasArr) {
            const canvas = Array.isArray(canvasArr) ? canvasArr[0] : canvasArr;
            drawRadar(canvas, r);
          }
        });
      });
    });

    // Markdown rendering helper
    const renderMarkdown = (text) => {
      if (!text) return '';
      if (typeof marked !== 'undefined') {
        return marked.parse(text);
      }
      // Fallback: basic formatting
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 .replace(/## (.*?)(\n|$)/g, '<h3>$1</h3>')
                 .replace(/\n/g, '<br>');
    };

    const downloadReport = () => {
      if (results.value.length === 1) {
        window.open(reportApi.download(results.value[0].id), '_blank');
      } else {
        results.value.forEach(r => {
          window.open(reportApi.download(r.id), '_blank');
        });
      }
    };

    // Image Library state and handlers
    const showImageLibrary = Vue.ref(false);
    const imageLibraryTargetProduct = Vue.ref(null);

    const openImageLibrary = (productId) => {
      imageLibraryTargetProduct.value = productId;
      showImageLibrary.value = true;
    };

    const refreshResults = async () => {
      try {
        await fetchResults();
        // Re-draw radar charts after data update
        Vue.nextTick(() => {
          results.value.forEach((r, idx) => {
            const refs = Vue.getCurrentInstance()?.proxy?.$refs;
            const canvasArr = refs?.['radar_' + idx];
            if (canvasArr) {
              const canvas = Array.isArray(canvasArr) ? canvasArr[0] : canvasArr;
              // Destroy old chart before redrawing
              const existing = Chart.getChart(canvas);
              if (existing) existing.destroy();
              drawRadar(canvas, r);
            }
          });
        });
      } catch (e) {
        console.error('Failed to refresh results:', e);
      }
    };

    const onImageAssigned = () => {
      refreshResults();
    };

    return { t, results, loading, maxScore, dimConfig, getRankedDimensions, downloadReport, renderMarkdown, showImageLibrary, imageLibraryTargetProduct, openImageLibrary, refreshResults, onImageAssigned };
  }
};
