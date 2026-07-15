// Dashboard View
const DashboardPage = {
  template: `
  <div>
    <!-- Hero Banner -->
    <div class="dash-hero">
      <div class="dash-hero-content">
        <div class="dash-hero-text">
          <span class="dash-hero-label">AI-POWERED EVALUATION</span>
          <h1>MUSECREA</h1>
          <p class="dash-hero-sub">{{ t('app.subtitle') }}</p>
          <p class="dash-hero-desc">{{ t('landing.tagline') }}</p>
          <div class="dash-hero-actions">
            <el-button type="primary" size="large" @click="$router.push('/upload')">
              {{ t('dash.uploadStart') }} →
            </el-button>
            <el-button class="btn-ghost" size="large" @click="$router.push('/history')">
              {{ t('dash.viewHistory') }}
            </el-button>
          </div>
        </div>
        <div class="dash-hero-visual">
          <svg viewBox="-30 0 260 200" width="400" height="400" fill="none" overflow="visible">
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <!-- Counter-rotating outer dashed ring -->
            <circle cx="100" cy="100" r="98" stroke="#ff6b00" stroke-width="0.5" opacity="0.15" stroke-dasharray="4 6">
              <animateTransform attributeName="transform" type="rotate" from="360 100 100" to="0 100 100" dur="60s" repeatCount="indefinite"/>
            </circle>
            <!-- Main rotating group: circles + dots + labels + lines -->
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="50s" repeatCount="indefinite"/>
              <!-- Concentric breathing circles -->
              <circle cx="100" cy="100" r="90" stroke="#ff6b00" stroke-width="1" opacity="0.15">
                <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite"/>
                <animate attributeName="r" values="88;93;88" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="100" cy="100" r="70" stroke="#ff6b00" stroke-width="1" opacity="0.25">
                <animate attributeName="opacity" values="0.25;0.5;0.25" dur="4s" begin="0.6s" repeatCount="indefinite"/>
                <animate attributeName="r" values="68;73;68" dur="4s" begin="0.6s" repeatCount="indefinite"/>
              </circle>
              <circle cx="100" cy="100" r="50" stroke="#ff6b00" stroke-width="1.5" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" begin="1.2s" repeatCount="indefinite"/>
                <animate attributeName="r" values="48;53;48" dur="4s" begin="1.2s" repeatCount="indefinite"/>
              </circle>
              <!-- Connecting lines from center to dots -->
              <line x1="100" y1="100" x2="100" y2="32" stroke="#ff6b00" stroke-width="0.5" opacity="0.3"/>
              <line x1="100" y1="100" x2="158" y2="75" stroke="#22c55e" stroke-width="0.5" opacity="0.3"/>
              <line x1="100" y1="100" x2="152" y2="135" stroke="#f093fb" stroke-width="0.5" opacity="0.3"/>
              <line x1="100" y1="100" x2="48" y2="135" stroke="#8b5cf6" stroke-width="0.5" opacity="0.3"/>
              <line x1="100" y1="100" x2="42" y2="75" stroke="#f59e0b" stroke-width="0.5" opacity="0.3"/>
              <!-- Electric current particles -->
              <circle r="2.5" fill="#ff6b00" opacity="0" filter="url(#glow)">
                <animate attributeName="cx" values="100;100;100" dur="2.5s" begin="0s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;32;100" dur="2.5s" begin="0s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" begin="0s" repeatCount="indefinite"/>
              </circle>
              <circle r="1.5" fill="#ff6b00" opacity="0">
                <animate attributeName="cx" values="100;100;100" dur="2.5s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;32;100" dur="2.5s" begin="0.4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="0.4s" repeatCount="indefinite"/>
              </circle>
              <circle r="2.5" fill="#22c55e" opacity="0" filter="url(#glow)">
                <animate attributeName="cx" values="100;158;100" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;75;100" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" begin="0.5s" repeatCount="indefinite"/>
              </circle>
              <circle r="1.5" fill="#22c55e" opacity="0">
                <animate attributeName="cx" values="100;158;100" dur="2.5s" begin="0.9s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;75;100" dur="2.5s" begin="0.9s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="0.9s" repeatCount="indefinite"/>
              </circle>
              <circle r="2.5" fill="#f093fb" opacity="0" filter="url(#glow)">
                <animate attributeName="cx" values="100;152;100" dur="2.5s" begin="1s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;135;100" dur="2.5s" begin="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" begin="1s" repeatCount="indefinite"/>
              </circle>
              <circle r="1.5" fill="#f093fb" opacity="0">
                <animate attributeName="cx" values="100;152;100" dur="2.5s" begin="1.4s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;135;100" dur="2.5s" begin="1.4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="1.4s" repeatCount="indefinite"/>
              </circle>
              <circle r="2.5" fill="#8b5cf6" opacity="0" filter="url(#glow)">
                <animate attributeName="cx" values="100;48;100" dur="2.5s" begin="1.5s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;135;100" dur="2.5s" begin="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" begin="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle r="1.5" fill="#8b5cf6" opacity="0">
                <animate attributeName="cx" values="100;48;100" dur="2.5s" begin="1.9s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;135;100" dur="2.5s" begin="1.9s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="1.9s" repeatCount="indefinite"/>
              </circle>
              <circle r="2.5" fill="#f59e0b" opacity="0" filter="url(#glow)">
                <animate attributeName="cx" values="100;42;100" dur="2.5s" begin="2s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;75;100" dur="2.5s" begin="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.5s" begin="2s" repeatCount="indefinite"/>
              </circle>
              <circle r="1.5" fill="#f59e0b" opacity="0">
                <animate attributeName="cx" values="100;42;100" dur="2.5s" begin="2.4s" repeatCount="indefinite"/>
                <animate attributeName="cy" values="100;75;100" dur="2.5s" begin="2.4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="2.4s" repeatCount="indefinite"/>
              </circle>
              <!-- Labels (counter-rotate to stay horizontal) -->
              <g><animateTransform attributeName="transform" type="rotate" from="360 100 22" to="0 100 22" dur="50s" repeatCount="indefinite"/><text x="100" y="22" text-anchor="middle" fill="#ff6b00" font-size="10" font-weight="600" font-family="Inter,sans-serif">Aesthetics</text></g>
              <g><animateTransform attributeName="transform" type="rotate" from="360 170 74" to="0 170 74" dur="50s" repeatCount="indefinite"/><text x="170" y="74" text-anchor="middle" fill="#22c55e" font-size="10" font-weight="600" font-family="Inter,sans-serif">Novelty</text></g>
              <g><animateTransform attributeName="transform" type="rotate" from="360 164 142" to="0 164 142" dur="50s" repeatCount="indefinite"/><text x="164" y="142" text-anchor="middle" fill="#f093fb" font-size="10" font-weight="600" font-family="Inter,sans-serif">Affect</text></g>
              <g><animateTransform attributeName="transform" type="rotate" from="360 40 142" to="0 40 142" dur="50s" repeatCount="indefinite"/><text x="40" y="142" text-anchor="middle" fill="#8b5cf6" font-size="10" font-weight="600" font-family="Inter,sans-serif">Cultural Values</text></g>
              <g><animateTransform attributeName="transform" type="rotate" from="360 30 74" to="0 30 74" dur="50s" repeatCount="indefinite"/><text x="30" y="74" text-anchor="middle" fill="#f59e0b" font-size="10" font-weight="600" font-family="Inter,sans-serif">Usefulness</text></g>
              <!-- Five dots with glow + pulse -->
              <circle cx="100" cy="32" r="4" fill="#ff6b00" filter="url(#glow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="158" cy="75" r="4" fill="#22c55e" filter="url(#glow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" begin="0.6s" repeatCount="indefinite"/>
              </circle>
              <circle cx="152" cy="135" r="4" fill="#f093fb" filter="url(#glow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" begin="1.2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="48" cy="135" r="4" fill="#8b5cf6" filter="url(#glow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" begin="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="42" cy="75" r="4" fill="#f59e0b" filter="url(#glow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="3s" begin="2.4s" repeatCount="indefinite"/>
              </circle>
            </g>
            <!-- Static center dot with glow (doesn't rotate) -->
            <circle cx="100" cy="100" r="7" fill="#ffd700" filter="url(#glow)">
              <animate attributeName="r" values="6;8;6" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
            </circle>
            <text x="100" y="118" text-anchor="middle" fill="#ffd700" font-size="9" font-weight="700" font-family="Inter,sans-serif" letter-spacing="1">Creativity</text>
          </svg>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--eval">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><polyline points="9 14 11 16 15 12"/></svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalEvaluations }}</h3>
          <p>{{ t('dash.totalEvals') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--score">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.avgScore || '--' }}</h3>
          <p>{{ t('dash.avgScore') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--credits">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a3 3 0 0 0-5 0c0 1.5 2 2.5 5 4-3 1.5-5 2.5-5 4a3 3 0 0 0 5 0"/><line x1="12" y1="6" x2="12" y2="7.5"/><line x1="12" y1="16.5" x2="12" y2="18"/></svg>
        </div>
        <div class="stat-info">
          <h3>{{ user?.credits || 0 }}</h3>
          <p>{{ t('dash.remaining') }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--products">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.totalProducts }}</h3>
          <p>{{ t('dash.totalProducts') }}</p>
        </div>
      </div>
    </div>

    <!-- Criteria Preview -->
    <div class="section-card" style="margin-bottom:24px">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        {{ t('dash.criteriaTitle') }}
      </h2>
      <p class="text-light" style="margin-bottom:16px;font-size:13px">{{ t('dash.criteriaDesc') }}</p>
      <div class="criteria-grid">
        <div class="criteria-card" style="--cc:#ff6b00">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ff6b00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <h4>{{ t('dim.aesthetics') }}</h4>
          <p>{{ t('dash.criteriaAesthetics') }}</p>
        </div>
        <div class="criteria-card" style="--cc:#22c55e">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          <h4>{{ t('dim.novelty') }}</h4>
          <p>{{ t('dash.criteriaNovelty') }}</p>
        </div>
        <div class="criteria-card" style="--cc:#f093fb">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f093fb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <h4>{{ t('dim.affect') }}</h4>
          <p>{{ t('dash.criteriaAffect') }}</p>
        </div>
        <div class="criteria-card" style="--cc:#8b5cf6">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h4>{{ t('dim.cultural') }}</h4>
          <p>{{ t('dash.criteriaCultural') }}</p>
        </div>
        <div class="criteria-card" style="--cc:#f59e0b">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <h4>{{ t('dim.usefulness') }}</h4>
          <p>{{ t('dash.criteriaUsefulness') }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-two-col">
      <div class="section-card">
        <h2 style="color:var(--primary)">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ t('dash.quickStart') }}
        </h2>
        <p class="text-light" style="margin-bottom:28px;font-size:14px">{{ t('dash.quickStartDesc') }}</p>
        <el-button type="primary" size="large" @click="$router.push('/upload')" style="width:100%;border-radius:28px;font-size:16px;height:48px">
          {{ t('dash.uploadStart') }}
        </el-button>
        <div style="margin-top:32px;text-align:center;">
          <span style="font-size:13px;color:var(--primary);font-weight:600;margin-right:8px;">{{ t('upload.templates') }}</span>
          <a href="/templates/Dataset Template.xlsx" download class="template-download-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ t('upload.templateFormat') }}
          </a>
          <a href="/templates/Demo Dataset.xlsx" download class="template-download-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {{ t('upload.templateDemo') }}
          </a>
        </div>
        <div style="margin-top:32px;display:flex;gap:12px;">
          <el-button class="btn-ghost" @click="$router.push('/history')" style="flex:1">{{ t('dash.viewHistory') }}</el-button>
          <el-button class="btn-ghost" @click="showCouponDialog = true" style="flex:1">{{ t('dash.redeemCoupon') }}</el-button>
        </div>
      </div>

      <div class="section-card">
        <h2>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          {{ t('dash.recentEvals') }}
        </h2>
        <div v-if="recentEvals.length === 0" class="text-muted" style="text-align:center;padding:30px">{{ t('dash.noRecords') }}</div>
        <div v-for="e in recentEvals" :key="e.id" class="history-item" @click="$router.push('/results/' + e.id)">
          <span class="h-product">{{ e.product_id }}</span>
          <span class="h-score">{{ e.creativity_score?.toFixed(2) }}</span>
          <span class="h-dims">{{ e.dimension_ranking?.slice(0,3).join(' > ') }}</span>
          <span class="h-date">{{ formatDate(e.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- News Section -->
    <div class="section-card" style="margin-top:24px">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        {{ t('dash.newsTitle') }}
      </h2>
      <div class="news-list">
        <div class="news-item" v-for="n in newsItems" :key="n.date" :class="{ 'news-item--link': n.link }" @click="n.link && $router.push(n.link)">
          <span class="news-date">{{ n.date }}</span>
          <el-tag :type="n.tagType" size="small" style="margin:0 12px">{{ n.tag }}</el-tag>
          <div class="news-content">
            <h4>{{ n.title }}<span v-if="n.pinned" class="news-pinned-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg> {{ t('dash.pinned') }}</span><span v-if="n.link" class="news-link-arrow"> &rarr;</span></h4>
            <p>{{ n.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 券码兑换弹窗 -->
    <Teleport to="body">
      <el-dialog v-model="showCouponDialog" :title="t('dash.redeemTitle')" width="400px" destroy-on-close>
        <el-input v-model="couponCode" :placeholder="t('dash.enterCoupon')" size="large" />
        <template #footer>
          <el-button @click="showCouponDialog = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="couponLoading" @click="redeemCoupon">{{ t('dash.redeem') }}</el-button>
        </template>
      </el-dialog>
    </Teleport>
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

    const newsItems = Vue.ref([
      { date: '2026.06.28', tag: 'GUIDE', tagType: 'success', title: t('dash.newsGuideTitle'), desc: t('dash.newsGuideDesc'), pinned: true, link: '/guide' },
      { date: '2026.07.13', tag: 'NEW', tagType: 'danger', title: t('dash.newsV5Title'), desc: t('dash.newsV5Desc') },
      { date: '2026.06.15', tag: 'NEW', tagType: 'danger', title: t('dash.newsLaunchTitle'), desc: t('dash.newsLaunchDesc') },
    ]);

    return { t, user, stats, recentEvals, showCouponDialog, couponCode, couponLoading, formatDate, redeemCoupon, newsItems };
  }
};
