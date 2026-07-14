// Guide View - User Guide Page
const GuidePage = {
  template: `
  <div>
    <div class="guide-hero">
      <div class="guide-hero-content">
        <span class="guide-hero-badge">GUIDE</span>
        <h1>{{ t('guide.title') }}</h1>
        <p class="guide-hero-desc">{{ t('guide.subtitle') }}</p>
      </div>
    </div>

    <!-- Section 1: Overview -->
    <div class="section-card guide-section">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        {{ t('guide.s1Title') }}
      </h2>
      <p class="guide-text">{{ t('guide.s1p1') }}</p>
      <div class="guide-flow">
        <div class="guide-flow-step">
          <div class="guide-flow-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <span>{{ t('guide.flow1') }}</span>
        </div>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        <div class="guide-flow-step">
          <div class="guide-flow-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
          </div>
          <span>{{ t('guide.flow2') }}</span>
        </div>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        <div class="guide-flow-step">
          <div class="guide-flow-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <span>{{ t('guide.flow3') }}</span>
        </div>
      </div>
    </div>

    <!-- Section 2: Excel Format -->
    <div class="section-card guide-section">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        {{ t('guide.s2Title') }}
      </h2>
      <p class="guide-text">{{ t('guide.s2p1') }}</p>

      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead>
            <tr>
              <th>{{ t('guide.colName') }}</th>
              <th>{{ t('guide.colType') }}</th>
              <th>{{ t('guide.colRequired') }}</th>
              <th>{{ t('guide.colDesc') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>Product ID</code></td><td>{{ t('guide.typeText') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colProductIdDesc') }}</td></tr>
            <tr><td><code>Aesthetics</code></td><td>{{ t('guide.typeInt') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colAestheticsDesc') }}</td></tr>
            <tr><td><code>Novelty</code></td><td>{{ t('guide.typeInt') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colNoveltyDesc') }}</td></tr>
            <tr><td><code>Affect</code></td><td>{{ t('guide.typeInt') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colAffectDesc') }}</td></tr>
            <tr><td><code>Cultural Values</code></td><td>{{ t('guide.typeInt') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colCultureDesc') }}</td></tr>
            <tr><td><code>Usefulness</code></td><td>{{ t('guide.typeInt') }}</td><td><el-tag type="danger" size="small">{{ t('guide.required') }}</el-tag></td><td>{{ t('guide.colUsefulnessDesc') }}</td></tr>
            <tr><td><code>Comments</code></td><td>{{ t('guide.typeText') }}</td><td><el-tag type="info" size="small">{{ t('guide.optional') }}</el-tag></td><td>{{ t('guide.colCommentsDesc') }}</td></tr>
          </tbody>
        </table>
      </div>

      <h3 style="margin-top:24px;font-size:15px;font-weight:600;color:var(--text)">{{ t('guide.scaleTitle') }}</h3>
      <p class="guide-text">{{ t('guide.scaleDesc') }}</p>
      <div class="guide-scale">
        <div class="guide-scale-item" v-for="n in 7" :key="n" :style="{ '--scale-color': scaleColors[n-1] }">
          <span class="guide-scale-num">{{ n }}</span>
          <span class="guide-scale-label">{{ scaleLabels[n-1] }}</span>
        </div>
      </div>

      <h3 style="margin-top:24px;font-size:15px;font-weight:600;color:var(--text)">{{ t('guide.sampleTitle') }}</h3>
      <div class="guide-table-wrap">
        <table class="guide-table guide-table-sm">
          <thead><tr><th>Product ID</th><th>Aesthetics</th><th>Novelty</th><th>Affect</th><th>Cultural Values</th><th>Usefulness</th><th>Comments</th></tr></thead>
          <tbody>
            <tr><td>P1</td><td>6</td><td>5</td><td>7</td><td>6</td><td>4</td><td class="comment-cell">{{ t('guide.sampleComment1') }}</td></tr>
            <tr><td>P1</td><td>7</td><td>6</td><td>6</td><td>7</td><td>5</td><td class="text-muted">—</td></tr>
            <tr><td>P1</td><td>4</td><td>3</td><td>5</td><td>6</td><td>3</td><td class="comment-cell">{{ t('guide.sampleComment2') }}</td></tr>
            <tr><td>P2</td><td>5</td><td>7</td><td>4</td><td>5</td><td>6</td><td class="comment-cell">{{ t('guide.sampleComment3') }}</td></tr>
            <tr><td>P2</td><td>6</td><td>5</td><td>6</td><td>4</td><td>5</td><td class="text-muted">—</td></tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="/templates/Dataset Template.xlsx" class="template-download-link" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          {{ t('upload.templateFormat') }}
        </a>
        <a href="/templates/Demo Dataset.xlsx" class="template-download-link" download>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          {{ t('upload.templateDemo') }}
        </a>
      </div>
    </div>

    <!-- Section 3: Key Rules -->
    <div class="section-card guide-section">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        {{ t('guide.s3Title') }}
      </h2>
      <div class="guide-rules">
        <div class="guide-rule">
          <div class="guide-rule-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div><h4>{{ t('guide.rule1Title') }}</h4><p>{{ t('guide.rule1Desc') }}</p></div>
        </div>
        <div class="guide-rule">
          <div class="guide-rule-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
          <div><h4>{{ t('guide.rule2Title') }}</h4><p>{{ t('guide.rule2Desc') }}</p></div>
        </div>
        <div class="guide-rule">
          <div class="guide-rule-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div><h4>{{ t('guide.rule3Title') }}</h4><p>{{ t('guide.rule3Desc') }}</p></div>
        </div>
        <div class="guide-rule">
          <div class="guide-rule-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
          <div><h4>{{ t('guide.rule4Title') }}</h4><p>{{ t('guide.rule4Desc') }}</p></div>
        </div>
      </div>
    </div>

    <!-- Section 4: Product Images -->
    <div class="section-card guide-section">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        {{ t('guide.s4Title') }}
      </h2>
      <p class="guide-text">{{ t('guide.s4p1') }}</p>
      <div class="guide-img-tips">
        <div class="guide-img-tip"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('guide.imgTip1') }}</span></div>
        <div class="guide-img-tip"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('guide.imgTip2') }}</span></div>
        <div class="guide-img-tip"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>{{ t('guide.imgTip3') }}</span></div>
        <div class="guide-img-tip"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>{{ t('guide.imgTip4') }}</span></div>
      </div>
    </div>

    <!-- Section 5: Understanding Results -->
    <div class="section-card guide-section">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        {{ t('guide.s5Title') }}
      </h2>
      <p class="guide-text">{{ t('guide.s5p1') }}</p>
      <div class="guide-dims">
        <div class="guide-dim" style="--dc:#ff6b00"><h4>{{ t('dim.aesthetics') }}</h4><p>{{ t('guide.dimAesthetics') }}</p></div>
        <div class="guide-dim" style="--dc:#22c55e"><h4>{{ t('dim.novelty') }}</h4><p>{{ t('guide.dimNovelty') }}</p></div>
        <div class="guide-dim" style="--dc:#f093fb"><h4>{{ t('dim.affect') }}</h4><p>{{ t('guide.dimAffect') }}</p></div>
        <div class="guide-dim" style="--dc:#8b5cf6"><h4>{{ t('dim.cultural') }}</h4><p>{{ t('guide.dimCultural') }}</p></div>
        <div class="guide-dim" style="--dc:#f59e0b"><h4>{{ t('dim.usefulness') }}</h4><p>{{ t('guide.dimUsefulness') }}</p></div>
      </div>
    </div>

    <!-- Section 6: Quick Start Steps -->
    <div class="section-card guide-section" style="margin-bottom:40px">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        {{ t('guide.s6Title') }}
      </h2>
      <div class="guide-steps">
        <div class="guide-step"><span class="guide-step-num">1</span><div><h4>{{ t('guide.step1Title') }}</h4><p>{{ t('guide.step1Desc') }}</p></div></div>
        <div class="guide-step-connector"></div>
        <div class="guide-step"><span class="guide-step-num">2</span><div><h4>{{ t('guide.step2Title') }}</h4><p>{{ t('guide.step2Desc') }}</p></div></div>
        <div class="guide-step-connector"></div>
        <div class="guide-step"><span class="guide-step-num">3</span><div><h4>{{ t('guide.step3Title') }}</h4><p>{{ t('guide.step3Desc') }}</p></div></div>
        <div class="guide-step-connector"></div>
        <div class="guide-step"><span class="guide-step-num">4</span><div><h4>{{ t('guide.step4Title') }}</h4><p>{{ t('guide.step4Desc') }}</p></div></div>
      </div>
      <div style="text-align:center;margin-top:28px">
        <el-button type="primary" size="large" @click="$router.push('/upload')">{{ t('guide.startBtn') }} &rarr;</el-button>
      </div>
    </div>
  </div>
  `,
  setup() {
    const scaleColors = ['#e74c3c', '#e67e22', '#f1c40f', '#95a5a6', '#3498db', '#2ecc71', '#22c55e'];
    const scaleLabels = [
      t('guide.scale1'), t('guide.scale2'), t('guide.scale3'),
      t('guide.scale4'), t('guide.scale5'), t('guide.scale6'), t('guide.scale7')
    ];
    return { t, scaleColors, scaleLabels };
  }
};
