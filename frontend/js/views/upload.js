// Upload View - Multi-step upload flow
const UploadPage = {
  template: `
  <div>
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-item" :class="{ active: step===1, done: step>1 }">
        <span class="step-num">{{ step > 1 ? '✓' : '1' }}</span>
        <span class="step-label">{{ t('upload.step1') }}</span>
      </div>
      <div class="step-connector" :class="{ done: step>1 }"></div>
      <div class="step-item" :class="{ active: step===2, done: step>2 }">
        <span class="step-num">{{ step > 2 ? '✓' : '2' }}</span>
        <span class="step-label">{{ t('upload.step2') }}</span>
      </div>
      <div class="step-connector" :class="{ done: step>2 }"></div>
      <div class="step-item" :class="{ active: step===3, done: step>3 }">
        <span class="step-num">{{ step > 3 ? '✓' : '3' }}</span>
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
      <h2>📤 {{ t('upload.title1') }}</h2>
      <p style="color:#666;margin-bottom:20px;font-size:14px">
        {{ t('upload.desc1') }}
      </p>
      <div class="upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <div class="upload-icon">📁</div>
        <h3>{{ t('upload.dropzone') }}</h3>
        <p>{{ t('upload.formats') }}</p>
        <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="handleFileSelect">
      </div>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" style="margin-top:20px">
        <el-progress :percentage="uploadProgress" :stroke-width="8" />
        <p style="text-align:center;color:#999;margin-top:8px">{{ t('upload.parsing') }}</p>
      </div>
    </div>

    <!-- Step 1.5: Preview & Warnings -->
    <div v-if="step === 1 && preview" class="section-card" style="margin-top:20px">
      <h2>📋 {{ t('upload.preview') }}</h2>
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

      <div style="text-align:center;margin-top:24px">
        <el-button type="primary" size="large" @click="step = 2">{{ t('upload.nextStep') }}</el-button>
      </div>
    </div>

    <!-- Step 2: Select Products -->
    <div v-if="step === 2" class="section-card">
      <h2>🎯 {{ t('upload.title2') }}</h2>
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <span class="text-light">{{ t('upload.productSummary', { total: preview.products.length, selected: selectedProducts.length }) }}</span>
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
                <span>✕ {{ t('upload.remove') }}</span>
              </div>
            </div>
            <div v-else class="product-img-dropzone" @click="openImagePicker(pid)">
              <span class="img-upload-icon">📷</span>
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
      <h2>⚡ {{ t('upload.title3') }}</h2>

      <el-descriptions :column="1" border style="margin-bottom:20px">
        <el-descriptions-item :label="t('upload.selectedProducts')">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <span v-for="pid in selectedProducts" :key="pid"
              style="display:inline-flex;align-items:center;gap:4px;background:#f0f2ff;padding:4px 12px;border-radius:16px;font-size:13px;">
              <span v-if="productImagePreviews[pid]" style="color:#67c23a;">📷</span>
              <span v-else style="color:#ccc;">📷</span>
              {{ pid }}
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('upload.productCountLabel')">{{ selectedProducts.length }} {{ t('upload.countUnit') }}</el-descriptions-item>
        <el-descriptions-item :label="t('upload.uploadedImages')">{{ Object.keys(productImagePreviews).length }} {{ t('upload.imageUnit') }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-bottom:20px">
        <el-checkbox v-model="runLlm" size="large">
          🤖 {{ t('upload.enableLlm') }}
        </el-checkbox>
      </div>

      <div class="cost-preview">
        <h3 style="margin-bottom:12px;font-size:15px;">💰 {{ t('upload.costEstimate') }}</h3>
        <div class="cost-row">
          <span>{{ t('upload.evalCalc', { count: selectedProducts.length }) }}</span>
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
          <span :style="{ color: userCredits >= totalCost ? '#67c23a' : '#f56c6c' }">{{ userCredits }} {{ t('upload.timesUnit') }}</span>
        </div>
      </div>

      <el-alert v-if="userCredits < totalCost" :title="t('upload.insufficientCredits')" type="error" show-icon style="margin-top:12px" />

      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;">
        <el-button size="large" @click="step = 2">← {{ t('upload.prevStep') }}</el-button>
        <el-button type="primary" size="large" :loading="running" :disabled="userCredits < totalCost" @click="runEvaluation">
          🚀 {{ t('upload.startEval') }}
        </el-button>
      </div>
    </div>

    <!-- Step 4: Running / Results -->
    <div v-if="step === 4 && running" class="section-card text-center">
      <el-progress type="circle" :percentage="runProgress" :width="120" :stroke-width="8" />
      <h3 style="margin-top:20px">{{ t('upload.calculating') }}</h3>
      <p class="text-light" style="margin-top:8px">{{ runStatusText }}</p>
    </div>

    <div v-if="step === 4 && !running && results.length > 0" class="section-card text-center">
      <div style="font-size:48px;margin-bottom:16px">🎉</div>
      <h2>{{ t('upload.done') }}</h2>
      <p class="text-light" style="margin:12px 0 24px">{{ t('upload.doneSummary', { count: results.length }) }}</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <el-button type="primary" size="large" @click="viewResults">📊 {{ t('upload.viewResults') }}</el-button>
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
          ElementPlus.ElMessage.success(t('upload.imagesUploaded', { count: imageEntries.length }));
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
