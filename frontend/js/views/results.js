// Results View - Display evaluation results with radar chart
const ResultsPage = {
  template: `
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2 style="font-size:22px"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> {{ t('results.title') }}</h2>
      <div style="display:flex;gap:10px;">
        <el-button @click="$router.push('/upload')"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></span> {{ t('results.newEval') }}</el-button>
        <el-button type="primary" v-if="results.length > 0" @click="downloadReport"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg></span> {{ t('results.downloadReport') }}</el-button>
      </div>
    </div>

    <div v-if="loading" class="section-card text-center">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-for="(r, idx) in results" :key="r.id" class="result-product-card">
      <div class="result-header">
        <!-- Left column: image + button -->
        <div class="result-img-col" :id="'imgcol_' + r.id">
          <div v-if="r.product_image" class="product-img" style="overflow:hidden;">
            <img :src="r.product_image" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <div v-else class="product-img product-img--placeholder" @click="openImageLibrary(r.product_id)"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span></div>
          <el-button size="small" @click="openImageLibrary(r.product_id)" style="margin-top:8px">
            {{ r.product_image ? t('results.changeImage') : t('results.uploadImage') }}
          </el-button>
        </div>

        <!-- Middle: product info -->
        <div style="flex:1">
          <h2 style="font-size:20px;margin-bottom:8px;">{{ t('results.product') }} {{ r.product_id }}</h2>
          <p v-if="r.product_name" class="text-light">{{ r.product_name }}</p>
          <div style="margin-top:12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <span class="creativity-score">{{ t('results.creativityScore') }} {{ r.creativity_score?.toFixed(4) }}</span>
            <span class="text-light" style="font-size:13px;">{{ t('results.sampleCount') }}{{ r.sample_count }}</span>
          </div>
        </div>

        <!-- Feedback Widget -->
        <div class="fb-widget" :id="'fbw_' + r.id">
          <h4 class="fb-widget-title">{{ t('results.fbTitle') }}</h4>
          <p class="fb-widget-desc">{{ t('results.fbDesc') }}</p>
          <div class="fb-widget-thumbs">
            <button class="fb-widget-thumb" :class="{ 'fb-up-active': fbSentiment === 'up' }" @click="fbSentiment = fbSentiment === 'up' ? '' : 'up'">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </button>
            <button class="fb-widget-thumb" :class="{ 'fb-down-active': fbSentiment === 'down' }" @click="fbSentiment = fbSentiment === 'down' ? '' : 'down'">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
              </svg>
            </button>
          </div>
          <textarea v-model="fbText" :placeholder="t('results.fbPlaceholder')" class="fb-widget-textarea" rows="3"></textarea>
          <input v-model="fbEmail" type="email" :placeholder="t('results.fbEmail')" class="fb-widget-input" />
          <p class="fb-widget-privacy">{{ t('results.fbPrivacy') }}</p>
          <el-button type="primary" size="small" :loading="fbSending" :disabled="!fbSentiment || fbSending" @click="submitFeedback" style="width:100%;">{{ t('results.fbSend') }}</el-button>
          <p v-if="fbSent" class="fb-widget-success">{{ t('results.fbSuccess') }}</p>
        </div>
      </div>

      <!-- Dimension Bars -->
      <h3 style="font-size:15px;margin-bottom:14px;">{{ t('results.dimRanking') }}</h3>
      <div class="dimension-bars">
        <div v-for="(dim, dIdx) in getRankedDimensions(r)" :key="dim.key" class="dim-bar-row">
          <span class="dim-bar-label">{{ dim.label }}</span>
          <div class="dim-bar-track">
            <div class="dim-bar-fill" :style="{ width: getBarWidth(r, dim.score) + '%', background: dim.color }"></div>
          </div>
          <span class="dim-bar-score" :style="{ color: dim.color }">{{ dim.score?.toFixed(2) }}</span>
          <span class="dim-bar-value">
            <span class="rank-badge" :class="'rank-' + (dIdx+1)">{{ t('results.rankN', dim.rank) }}</span>
          </span>
        </div>
      </div>
      <div style="text-align:right;font-size:14px;color:var(--text-light);margin-top:6px;font-family:var(--font-mono);opacity:0.7;">
        * {{ t('results.maxScoreNote') }}
      </div>

      <!-- Radar Chart -->
      <div class="radar-container">
        <canvas :id="'radar_' + r.id" width="500" height="500"></canvas>
      </div>

      <!-- LLM Analysis -->
      <div v-if="r.llm_analysis" class="analysis-block">
        <h3><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></span> {{ t('results.aiAnalysis') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.llm_analysis)"></div>
      </div>

      <div v-if="r.improvement_suggestions" class="suggestions-block">
        <h3><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/></svg></span> {{ t('results.suggestions') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.improvement_suggestions)"></div>
      </div>
    </div>

    <div v-if="!loading && results.length === 0" class="section-card text-center">
      <div style="font-size:48px;margin-bottom:16px"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span></div>
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
      { key: 'Novelty', label: t('dim.novelty'), color: '#ff6b00' },
      { key: 'Usefulness', label: t('dim.usefulness'), color: '#22c55e' },
      { key: 'Affect', label: t('dim.affect'), color: '#f093fb' },
      { key: 'Aesthetics', label: t('dim.aesthetics'), color: '#8b5cf6' },
      { key: 'Cultural Values', label: t('dim.cultural'), color: '#f59e0b' },
    ];

    const getRankedDimensions = (r) => {
      if (!r.dimension_scores) return dimConfig.map((d, i) => ({ ...d, score: 0, rank: i + 1 }));
      const items = dimConfig.map(d => ({ ...d, score: r.dimension_scores[d.key] || 0 }));
      items.sort((a, b) => b.score - a.score);
      return items.map((item, i) => ({ ...item, rank: i + 1 }));
    };

    // Zoomed bar width: scale from ~80% of min score, so differences are visible
    const getBarWidth = (r, score) => {
      if (!r.dimension_scores) return 0;
      const scores = Object.values(r.dimension_scores);
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const baseline = min * 0.8;
      const range = max - baseline;
      if (range <= 0) return 100;
      return Math.max(5, ((score - baseline) / range) * 100);
    };

    const drawRadar = (canvasRef, r) => {
      if (!canvasRef || !r.dimension_scores) return;
      const ctx = canvasRef.getContext('2d');
      const scores = dimConfig.map(d => r.dimension_scores[d.key] || 0);
      const labels = dimConfig.map(d => d.label);
      const colors = dimConfig.map(d => d.color);
      const min = Math.min(...scores);
      const max = Math.max(...scores, 1);
      // Zoomed scale: start from ~80% of min, max + 10% buffer
      const suggestedMin = Math.floor(min * 0.8 * 10) / 10;
      const suggestedMax = Math.ceil(max * 1.1 * 10) / 10;

      // Plugin: draw value labels at each data point
      const dataLabelsPlugin = {
        id: 'radarDataLabels',
        afterDatasetsDraw(chart) {
          const meta = chart.getDatasetMeta(0);
          if (!meta) return;
          const ctxDraw = chart.ctx;
          meta.data.forEach((point, i) => {
            const value = scores[i];
            ctxDraw.save();
            ctxDraw.font = 'bold 14px "Consolas", "Courier New", monospace';
            ctxDraw.fillStyle = colors[i];
            ctxDraw.strokeStyle = '#0f0f23';
            ctxDraw.lineWidth = 3;
            ctxDraw.textAlign = 'center';
            ctxDraw.textBaseline = 'bottom';
            const y = point.y - 10;
            ctxDraw.strokeText(value.toFixed(2), point.x, y);
            ctxDraw.fillText(value.toFixed(2), point.x, y);
            ctxDraw.restore();
          });
        }
      };

      new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: t('dim.scoreLabel'),
            data: scores,
            borderColor: 'rgba(32,156,238,0.8)',
            backgroundColor: 'rgba(32,156,238,0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: colors,
            pointBorderColor: '#0f0f23',
            pointBorderWidth: 2,
            pointRadius: 7,
            pointHoverRadius: 10,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: false,
              suggestedMin: suggestedMin,
              suggestedMax: suggestedMax,
              ticks: { display: false, stepSize: 0.1 },
              pointLabels: { font: { size: 14, family: 'Microsoft YaHei', weight: 'bold' }, color: colors, padding: 16 },
              grid: { color: 'rgba(128,128,128,0.3)', lineWidth: 1 },
              angleLines: { color: 'rgba(128,128,128,0.4)', lineWidth: 1 },
            }
          },
          plugins: { legend: { display: false } }
        },
        plugins: [dataLabelsPlugin]
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
        results.value.forEach((r) => {
          const canvas = document.getElementById('radar_' + r.id);
          if (canvas) {
            drawRadar(canvas, r);
          }
          // Sync image size: make image a square matching fb-widget height
          const fbw = document.getElementById('fbw_' + r.id);
          const imgDiv = document.querySelector('#imgcol_' + r.id + ' .product-img');
          if (fbw && imgDiv) {
            const h = fbw.offsetHeight;
            if (h > 0) {
              imgDiv.style.width = h + 'px';
              imgDiv.style.height = h + 'px';
              imgDiv.style.flex = 'none';
            }
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
          results.value.forEach((r) => {
            const canvas = document.getElementById('radar_' + r.id);
            if (canvas) {
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

    // Feedback widget state
    const fbSentiment = Vue.ref('');
    const fbText = Vue.ref('');
    const fbEmail = Vue.ref('');
    const fbSending = Vue.ref(false);
    const fbSent = Vue.ref(false);

    const submitFeedback = async () => {
      if (!fbSentiment.value || results.value.length === 0) return;
      fbSending.value = true;
      try {
        await reportApi.sendFeedback(results.value[0].id, fbSentiment.value, fbText.value);
        fbSent.value = true;
        fbSentiment.value = '';
        fbText.value = '';
        fbEmail.value = '';
        ElementPlus.ElMessage.success(t('results.fbSuccess'));
      } catch (e) {
        ElementPlus.ElMessage.error(t('results.fbFailed'));
      } finally {
        fbSending.value = false;
      }
    };

    return { t, results, loading, maxScore, dimConfig, getRankedDimensions, getBarWidth, downloadReport, renderMarkdown, showImageLibrary, imageLibraryTargetProduct, openImageLibrary, refreshResults, onImageAssigned, fbSentiment, fbText, fbEmail, fbSending, fbSent, submitFeedback };
  }
};
