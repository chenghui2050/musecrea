// Upload View - Multi-step upload flow
const UploadPage = {
  template: `
  <div>
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-item" :class="{ active: step===1, done: step>1 }">
        <span class="step-num">
          <svg v-if="step > 1" width="14" height="14" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor"><rect x="5" y="1" width="2" height="1"/><rect x="4" y="2" width="2" height="1"/><rect x="3" y="3" width="2" height="1"/><rect x="1" y="4" width="3" height="1"/><rect x="2" y="5" width="2" height="1"/></svg>
          <span v-else>1</span>
        </span>
        <span class="step-label">{{ t('upload.step1') }}</span>
      </div>
      <div class="step-connector" :class="{ done: step>1 }"></div>
      <div class="step-item" :class="{ active: step===2, done: step>2 }">
        <span class="step-num">
          <svg v-if="step > 2" width="14" height="14" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor"><rect x="5" y="1" width="2" height="1"/><rect x="4" y="2" width="2" height="1"/><rect x="3" y="3" width="2" height="1"/><rect x="1" y="4" width="3" height="1"/><rect x="2" y="5" width="2" height="1"/></svg>
          <span v-else>2</span>
        </span>
        <span class="step-label">{{ t('upload.step2') }}</span>
      </div>
      <div class="step-connector" :class="{ done: step>2 }"></div>
      <div class="step-item" :class="{ active: step===3, done: step>3 }">
        <span class="step-num">
          <svg v-if="step > 3" width="14" height="14" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor"><rect x="5" y="1" width="2" height="1"/><rect x="4" y="2" width="2" height="1"/><rect x="3" y="3" width="2" height="1"/><rect x="1" y="4" width="3" height="1"/><rect x="2" y="5" width="2" height="1"/></svg>
          <span v-else>3</span>
        </span>
        <span class="step-label">{{ t('upload.step3') }}</span>
      </div>
      <div class="step-connector" :class="{ done: step>3 }"></div>
      <div class="step-item" :class="{ active: step===4 }">
        <span class="step-num">4</span>
        <span class="step-label">{{ t('upload.step4') }}</span>
      </div>
    </div>

    <!-- Step 1: Upload File -->
    <div v-if="step === 1" class="section-card">
      <h2><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></span> {{ t('upload.title1') }}</h2>
      <p class="text-light" style="margin-bottom:20px;font-size:14px">
        {{ t('upload.desc1') }}
      </p>
      <div class="upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <div class="upload-icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span></div>
        <h3>{{ t('upload.dropzone') }}</h3>
        <p>{{ t('upload.formats') }}</p>
        <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="handleFileSelect">
      </div>
      <!-- Template Downloads -->
      <div style="margin-top:16px;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:13px;color:var(--primary);font-weight:600;">{{ t('upload.templates') }}</span>
        <a href="/templates/Dataset Template.xlsx" download class="template-download-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ t('upload.templateFormat') }}
        </a>
        <a href="/templates/Demo Dataset.xlsx" download class="template-download-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ t('upload.templateDemo') }}
        </a>
      </div>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" style="margin-top:20px">
        <el-progress :percentage="uploadProgress" :stroke-width="8" color="#ff6b00" />
        <p class="text-muted" style="text-align:center;margin-top:8px">{{ t('upload.parsing') }}</p>
      </div>

      <!-- Preview & Warnings (shown after file parse) -->
      <div v-if="preview" style="margin-top:24px;padding:20px;border-radius:var(--radius-sm);background:var(--bg-surface);border:1px solid var(--border);">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          {{ t('upload.preview') }}
        </h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('upload.fileName')">{{ filename }}</el-descriptions-item>
          <el-descriptions-item :label="t('upload.totalRows')">{{ preview.total_rows }}</el-descriptions-item>
          <el-descriptions-item :label="t('upload.productCount')">{{ preview.products.length }}</el-descriptions-item>
          <el-descriptions-item :label="t('upload.hasComments')">
            <el-tag :type="preview.has_comments ? 'success' : 'danger'" size="small">
              {{ preview.has_comments ? t('common.yes') : t('common.no') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('upload.validComments')" v-if="preview.has_comments">{{ preview.valid_comments_count }}</el-descriptions-item>
        </el-descriptions>
        <el-alert v-for="(w, i) in warnings" :key="i" :title="w" type="warning" show-icon :closable="false" style="margin-top:10px" />
        <div style="text-align:center;margin-top:16px">
          <el-button type="primary" size="large" @click="step = 2">{{ t('upload.nextStep') }}</el-button>
        </div>
      </div>

      <!-- Criteria Cards -->
      <div style="margin-top:32px">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:6px;color:var(--primary)">
          {{ t('dash.criteriaTitle') }} <span style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;margin-left:8px">CRITERIA</span>
        </h3>
        <p class="text-muted" style="font-size:12px;margin-bottom:16px">{{ t('dash.criteriaDesc') }}</p>
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
    </div>

    <!-- Step 2: Select Products -->
    <div v-if="step === 2" class="section-card">
      <h2><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span> {{ t('upload.title2') }}</h2>
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <span class="text-light">{{ t('upload.productSummary', preview.products.length, selectedProducts.length) }}</span>
        <el-button type="primary" link @click="toggleSelectAll">
          {{ selectedProducts.length === preview.products.length ? t('upload.deselectAll') : t('upload.selectAll') }}
        </el-button>
      </div>
      <div class="product-select-grid">
        <div v-for="pid in preview.products" :key="pid"
          class="product-select-item" :class="{ selected: selectedProducts.includes(pid) }"
          @click="toggleProduct(pid)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="pid">{{ pid }}</div>
            <el-tag v-if="selectedProducts.includes(pid)" type="success" size="small">{{ t('upload.selectedTag') }}</el-tag>
          </div>
          <div class="count">{{ t('upload.sampleCount') }}：{{ preview.sample_counts[pid] }}</div>
          <el-tag v-if="preview.sample_counts[pid] < 200" type="warning" size="small" style="margin-top:6px">{{ t('upload.sampleLow') }}</el-tag>

          <!-- Product Image Upload - always visible, click handled separately -->
          <div class="product-img-upload" @click="$event.stopPropagation()">
            <div v-if="productImagePreviews && productImagePreviews[pid]" class="product-img-preview">
              <img :src="productImagePreviews[pid]" />
              <div class="product-img-overlay" @click="removeProductImage(pid)">
                <span><svg width="12" height="12" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" style="vertical-align:middle;margin-right:4px"><rect x="1" y="1" width="1" height="1"/><rect x="6" y="1" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/><rect x="3" y="3" width="2" height="1"/><rect x="3" y="4" width="2" height="1"/><rect x="2" y="5" width="1" height="1"/><rect x="5" y="5" width="1" height="1"/><rect x="1" y="6" width="1" height="1"/><rect x="6" y="6" width="1" height="1"/></svg>{{ t('upload.remove') }}</span>
              </div>
            </div>
            <div v-else class="product-img-dropzone" @click="openImagePicker(pid)">
              <span class="img-upload-icon"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span></span>
              <span class="img-upload-text">{{ t('upload.clickUpload') }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Shared hidden file input for product images -->
      <input ref="sharedImgInput" type="file" accept="image/*" style="position:absolute;visibility:hidden;width:0;height:0;" @change="onSharedImageChange">

      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;">
        <el-button size="large" @click="step = 1">← {{ t('upload.prevStep') }}</el-button>
        <el-button type="primary" size="large" :disabled="selectedProducts.length === 0" :loading="uploadingImages" @click="goToConfirm">
          {{ uploadingImages ? t('upload.uploading') : t('upload.nextConfirm') }}
        </el-button>
      </div>
    </div>

    <!-- Step 3: Confirm & Run -->
    <div v-if="step === 3" class="section-card">
      <h2><svg width="16" height="16" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="var(--warning)" style="vertical-align:middle;margin-right:6px"><rect x="4" y="0" width="3" height="1"/><rect x="3" y="1" width="3" height="1"/><rect x="2" y="2" width="3" height="1"/><rect x="1" y="3" width="5" height="1"/><rect x="3" y="4" width="3" height="1"/><rect x="2" y="5" width="3" height="1"/><rect x="1" y="6" width="3" height="1"/></svg>{{ t('upload.title3') }}</h2>

      <el-descriptions :column="1" border style="margin-bottom:20px">
        <el-descriptions-item :label="t('upload.selectedProducts')">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <span v-for="pid in selectedProducts" :key="pid" class="product-chip">
              <span v-if="productImagePreviews[pid]" style="color:#92cc41;"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span></span>
              <span v-else class="text-muted"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span></span>
              {{ pid }}
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('upload.productCountLabel')">{{ selectedProducts.length }} {{ t('upload.countUnit') }}</el-descriptions-item>
        <el-descriptions-item :label="t('upload.uploadedImages')">{{ Object.keys(productImagePreviews).length }} {{ t('upload.imageUnit') }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-bottom:20px">
        <el-checkbox v-model="runLlm" size="large">
          <span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg></span> {{ t('upload.enableLlm') }}
        </el-checkbox>
      </div>

      <div class="cost-preview">
        <h3 style="margin-bottom:12px;font-size:15px;"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span> {{ t('upload.costEstimate') }}</h3>
        <div class="cost-row">
          <span>{{ t('upload.evalCalc', selectedProducts.length) }}</span>
          <span>{{ selectedProducts.length }} {{ t('upload.timesUnit') }}</span>
        </div>
        <div class="cost-row" v-if="runLlm">
          <span>{{ t('upload.aiAnalysis') }}</span>
          <span>{{ selectedProducts.length }} {{ t('upload.timesUnit') }}</span>
        </div>
        <div class="cost-row total">
          <span>{{ t('upload.totalCost') }}</span>
          <span>{{ totalCost }} {{ t('upload.timesUnit') }}</span>
        </div>
        <div class="cost-row">
          <span>{{ t('upload.currentBalance') }}</span>
          <span :style="{ color: userCredits >= totalCost ? '#92cc41' : '#e76e55' }">{{ userCredits }} {{ t('upload.timesUnit') }}</span>
        </div>
      </div>

      <el-alert v-if="userCredits < totalCost" :title="t('upload.insufficientCredits')" type="error" show-icon style="margin-top:12px" />

      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;">
        <el-button size="large" @click="step = 2">← {{ t('upload.prevStep') }}</el-button>
        <el-button type="primary" size="large" :loading="running" :disabled="userCredits < totalCost" @click="runEvaluation">
          <span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span> {{ t('upload.startEval') }}
        </el-button>
      </div>
    </div>

    <!-- Step 4: Running / Results -->
    <div v-if="step === 4 && running" class="section-card text-center">
      <el-progress type="circle" :percentage="runProgress" :width="120" :stroke-width="8" color="#ff6b00" />
      <h3 style="margin-top:20px">{{ t('upload.calculating') }}</h3>
      <p class="text-light" style="margin-top:8px">{{ runStatusText }}</p>
    </div>

    <div v-if="step === 4 && !running && results.length > 0" class="section-card text-center">
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px">
        <span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg></span>
        <h2 style="margin:0">{{ t('upload.done') }}</h2>
      </div>
      <p class="text-light" style="margin:12px 0 24px">{{ t('upload.doneSummary', results.length, totalCost) }}</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <el-button type="primary" size="large" @click="viewResults"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg class="px-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> {{ t('upload.viewResults') }}</el-button>
        <el-button size="large" @click="$router.push('/dashboard')">{{ t('upload.backHome') }}</el-button>
      </div>
    </div>
  </div>
  `,
  setup() {
    const router = VueRouter.useRouter();
    const step = Vue.ref(1);
    const fileInput = Vue.ref(null);
    const filename = Vue.ref('');
    const preview = Vue.ref(null);
    const warnings = Vue.ref([]);
    const uploadId = Vue.ref('');
    const uploadProgress = Vue.ref(0);
    const selectedProducts = Vue.ref([]);
    const runLlm = Vue.ref(true);
    const running = Vue.ref(false);
    const runProgress = Vue.ref(0);
    const runStatusText = Vue.ref('');
    const results = Vue.ref([]);
    const userCredits = Vue.ref(getUser()?.credits || 0);

    // Product image upload state
    const productImages = Vue.ref({});       // { productId: File }
    const productImagePreviews = Vue.ref({}); // { productId: dataURL }
    const uploadingImages = Vue.ref(false);
    const sharedImgInput = Vue.ref(null);
    const activeImagePid = Vue.ref(null);

    const totalCost = Vue.computed(() => {
      const base = selectedProducts.value.length;
      return runLlm.value ? base * 2 : base;
    });

    const triggerFileInput = () => fileInput.value?.click();

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) uploadFile(file);
    };

    const handleDrop = (e) => {
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    };

    const uploadFile = async (file) => {
      filename.value = file.name;
      uploadProgress.value = 10;
      try {
        uploadProgress.value = 40;
        const res = await uploadApi.uploadExcel(file);
        uploadProgress.value = 100;
        uploadId.value = res.upload_id;
        preview.value = res.preview;
        warnings.value = res.warnings || [];
        ElementPlus.ElMessage.success(t('upload.parseSuccess'));
      } catch (e) {
        uploadProgress.value = 0;
        ElementPlus.ElMessage.error(e.message);
      }
    };

    const toggleProduct = (pid) => {
      const idx = selectedProducts.value.indexOf(pid);
      if (idx >= 0) selectedProducts.value.splice(idx, 1);
      else selectedProducts.value.push(pid);
    };

    const toggleSelectAll = () => {
      if (selectedProducts.value.length === preview.value.products.length) {
        selectedProducts.value = [];
      } else {
        selectedProducts.value = [...preview.value.products];
      }
    };

    // Product image handlers - use shared file input
    const openImagePicker = (pid) => {
      activeImagePid.value = pid;
      if (sharedImgInput.value) {
        sharedImgInput.value.value = '';  // reset so same file can be picked again
        sharedImgInput.value.click();
      }
    };

    const onSharedImageChange = (e) => {
      const file = e.target.files[0];
      const pid = activeImagePid.value;
      if (file && pid) {
        setProductImage(pid, file);
      }
    };

    const setProductImage = (pid, file) => {
      productImages.value[pid] = file;
      // Generate preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        productImagePreviews.value = { ...productImagePreviews.value, [pid]: ev.target.result };
      };
      reader.readAsDataURL(file);
    };

    const removeProductImage = (pid) => {
      delete productImages.value[pid];
      const newPreviews = { ...productImagePreviews.value };
      delete newPreviews[pid];
      productImagePreviews.value = newPreviews;
    };

    const goToConfirm = async () => {
      // Batch upload product images if any
      const imageEntries = Object.entries(productImages.value);
      if (imageEntries.length > 0) {
        uploadingImages.value = true;
        try {
          const formData = new FormData();
          for (const [pid, file] of imageEntries) {
            // Rename file to productId + extension so backend can match
            const ext = file.name.substring(file.name.lastIndexOf('.'));
            const renamedFile = new File([file], pid + ext, { type: file.type });
            formData.append('files', renamedFile);
          }
          await api.post('/upload/images/batch', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          ElementPlus.ElMessage.success(t('upload.imagesUploaded', imageEntries.length));
        } catch (e) {
          ElementPlus.ElMessage.warning(t('upload.imageUploadFail') + '：' + e.message + t('upload.skipImages'));
        } finally {
          uploadingImages.value = false;
        }
      }

      step.value = 3;
      try {
        const user = await authApi.getMe();
        userCredits.value = user.credits;
      } catch (e) {}
    };

    const runEvaluation = async () => {
      step.value = 4;
      running.value = true;
      runProgress.value = 0;
      runStatusText.value = t('upload.preparing');

      // Simulated progress timer
      let progressTimer = null;
      const startProgressTimer = (startVal, endVal, durationMs, statusText) => {
        runProgress.value = startVal;
        runStatusText.value = statusText;
        const steps = 20;
        const increment = (endVal - startVal) / steps;
        const interval = durationMs / steps;
        let current = startVal;
        progressTimer = setInterval(() => {
          current += increment;
          if (current >= endVal) {
            current = endVal;
            clearInterval(progressTimer);
            progressTimer = null;
          }
          runProgress.value = Math.round(current);
        }, interval);
      };

      const stopTimer = () => {
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
      };

      try {
        // Phase 1: Algorithm calculation (0-20%, ~3 seconds)
        startProgressTimer(0, 20, 3000, t('upload.runningAlgorithm'));

        // Wait a moment then start phase 2
        await new Promise(r => setTimeout(r, 1500));

        if (runLlm.value) {
          // Phase 2: LLM analysis (20-85%, estimated based on product count)
          const estimatedMs = selectedProducts.value.length * 8000; // ~8s per product
          stopTimer();
          startProgressTimer(20, 85, estimatedMs, t('upload.runningLlm'));
        } else {
          stopTimer();
          startProgressTimer(20, 85, 2000, t('upload.savingResults'));
        }

        const res = await evalApi.run(uploadId.value, {
          product_ids: selectedProducts.value,
          run_llm_analysis: runLlm.value,
        });

        // Phase 3: Complete
        stopTimer();
        runProgress.value = 100;
        runStatusText.value = t('upload.calcDone');
        results.value = res.results;
      } catch (e) {
        stopTimer();
        ElementPlus.ElMessage.error(e.message);
        step.value = 3;
      } finally {
        running.value = false;
      }
    };

    const viewResults = () => {
      if (results.value.length === 1) {
        router.push('/results/' + results.value[0].id);
      } else {
        const ids = results.value.map(r => r.id).join(',');
        router.push('/results?ids=' + ids);
      }
    };

    return {
      t, step, fileInput, filename, preview, warnings, uploadId, uploadProgress,
      selectedProducts, runLlm, running, runProgress, runStatusText, results,
      userCredits, totalCost,
      productImages, productImagePreviews, uploadingImages,
      sharedImgInput, activeImagePid,
      triggerFileInput, handleFileSelect, handleDrop, toggleProduct, toggleSelectAll,
      openImagePicker, onSharedImageChange, removeProductImage,
      goToConfirm, runEvaluation, viewResults,
    };
  }
};
