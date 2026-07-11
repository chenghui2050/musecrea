// Results View - Display evaluation results with radar chart
const ResultsPage = {
  template: `
  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <h2 style="font-size:22px"><span class="px-icon px-bar"></span> {{ t('results.title') }}</h2>
      <div style="display:flex;gap:10px;">
        <el-button @click="$router.push('/upload')"><span class="px-icon px-upload"></span> {{ t('results.newEval') }}</el-button>
        <el-button type="primary" v-if="results.length > 0" @click="downloadReport"><span class="px-icon px-down"></span> {{ t('results.downloadReport') }}</el-button>
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
          <div v-else class="product-img product-img--placeholder" @click="openImageLibrary(r.product_id)"><span class="px-icon px-museum" style="width:72px;height:72px;"></span></div>
          <el-button size="small" @click="openImageLibrary(r.product_id)" style="margin-top:8px">
            <span class="px-icon px-cam"></span> {{ r.product_image ? t('results.changeImage') : t('results.uploadImage') }}
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
              <svg width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor">
                <rect x="7" y="0" width="3" height="2"/>
                <rect x="7" y="2" width="4" height="1"/>
                <rect x="7" y="3" width="5" height="1"/>
                <rect x="8" y="4" width="6" height="1"/>
                <rect x="8" y="5" width="7" height="1"/>
                <rect x="0" y="6" width="5" height="4"/>
                <rect x="6" y="6" width="9" height="1"/>
                <rect x="7" y="7" width="8" height="1"/>
                <rect x="7" y="8" width="8" height="1"/>
                <rect x="0" y="10" width="5" height="4"/>
                <rect x="6" y="10" width="7" height="1"/>
                <rect x="6" y="11" width="6" height="1"/>
                <rect x="6" y="12" width="5" height="1"/>
                <rect x="6" y="13" width="4" height="2"/>
              </svg>
            </button>
            <button class="fb-widget-thumb" :class="{ 'fb-down-active': fbSentiment === 'down' }" @click="fbSentiment = fbSentiment === 'down' ? '' : 'down'">
              <svg width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor">
                <rect x="1" y="0" width="3" height="1"/>
                <rect x="1" y="1" width="4" height="1"/>
                <rect x="2" y="2" width="4" height="1"/>
                <rect x="2" y="3" width="3" height="1"/>
                <rect x="2" y="4" width="3" height="1"/>
                <rect x="0" y="5" width="4" height="4"/>
                <rect x="4" y="5" width="8" height="1"/>
                <rect x="4" y="6" width="7" height="1"/>
                <rect x="4" y="7" width="6" height="1"/>
                <rect x="4" y="8" width="5" height="1"/>
                <rect x="6" y="9" width="4" height="1"/>
                <rect x="0" y="10" width="4" height="1"/>
                <rect x="6" y="10" width="3" height="1"/>
                <rect x="0" y="11" width="4" height="1"/>
                <rect x="6" y="11" width="2" height="1"/>
                <rect x="0" y="12" width="4" height="1"/>
                <rect x="5" y="12" width="2" height="1"/>
                <rect x="0" y="13" width="4" height="1"/>
                <rect x="5" y="13" width="2" height="2"/>
                <rect x="0" y="14" width="4" height="2"/>
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
        <h3><span class="px-icon px-icon-xxl px-bot"></span> {{ t('results.aiAnalysis') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.llm_analysis)"></div>
      </div>

      <div v-if="r.improvement_suggestions" class="suggestions-block">
        <h3><span class="px-icon px-icon-xxl px-bulb"></span> {{ t('results.suggestions') }}</h3>
        <div class="md-content" v-html="renderMarkdown(r.improvement_suggestions)"></div>
      </div>
    </div>

    <div v-if="!loading && results.length === 0" class="section-card text-center">
      <div style="font-size:48px;margin-bottom:16px"><span class="px-icon px-icon-xl px-empty"></span></div>
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
      { key: 'Novelty', label: t('dim.novelty'), color: '#209cee' },
      { key: 'Usefulness', label: t('dim.usefulness'), color: '#92cc41' },
      { key: 'Affect', label: t('dim.affect'), color: '#e76e55' },
      { key: 'Aesthetics', label: t('dim.aesthetics'), color: '#f093fb' },
      { key: 'Cultural Values', label: t('dim.cultural'), color: '#f7d51d' },
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
