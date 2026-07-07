// Upload View - Multi-step upload flow
const UploadPage = {
  template: `
  <div>
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step-item" :class="{ active: step===1, done: step>1 }">
        <span class="step-num">{{ step > 1 ? '✓' : '1' }}</span>
        <span class="step-label">上传数据</span>
      </div>
      <div class="step-connector" :class="{ done: step>1 }"></div>
      <div class="step-item" :class="{ active: step===2, done: step>2 }">
        <span class="step-num">{{ step > 2 ? '✓' : '2' }}</span>
        <span class="step-label">选择产品</span>
      </div>
      <div class="step-connector" :class="{ done: step>2 }"></div>
      <div class="step-item" :class="{ active: step===3, done: step>3 }">
        <span class="step-num">{{ step > 3 ? '✓' : '3' }}</span>
        <span class="step-label">确认运行</span>
      </div>
      <div class="step-connector" :class="{ done: step>3 }"></div>
      <div class="step-item" :class="{ active: step===4 }">
        <span class="step-num">4</span>
        <span class="step-label">查看结果</span>
      </div>
    </div>

    <!-- Step 1: Upload File -->
    <div v-if="step === 1" class="section-card">
      <h2>📤 上传评价数据</h2>
      <p style="color:#666;margin-bottom:20px;font-size:14px">
        请上传包含消费者问卷数据的 Excel 文件（.xlsx），需包含 Product ID、各维度评分和 Comments 列。
      </p>
      <div class="upload-zone" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <div class="upload-icon">📁</div>
        <h3>点击或拖拽文件到此处</h3>
        <p>支持 .xlsx / .xls / .csv 格式，最大 20MB</p>
        <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display:none" @change="handleFileSelect">
      </div>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" style="margin-top:20px">
        <el-progress :percentage="uploadProgress" :stroke-width="8" />
        <p style="text-align:center;color:#999;margin-top:8px">正在上传并解析数据...</p>
      </div>
    </div>

    <!-- Step 1.5: Preview & Warnings -->
    <div v-if="step === 1 && preview" class="section-card" style="margin-top:20px">
      <h2>📋 数据预览</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文件名">{{ filename }}</el-descriptions-item>
        <el-descriptions-item label="总行数">{{ preview.total_rows }}</el-descriptions-item>
        <el-descriptions-item label="产品数">{{ preview.products.length }}</el-descriptions-item>
        <el-descriptions-item label="包含评论">
          <el-tag :type="preview.has_comments ? 'success' : 'danger'" size="small">
            {{ preview.has_comments ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="有效评论数" v-if="preview.has_comments">{{ preview.valid_comments_count }}</el-descriptions-item>
      </el-descriptions>

      <el-alert v-for="(w, i) in warnings" :key="i" :title="w" type="warning" show-icon :closable="false" style="margin-top:10px" />

      <div style="text-align:center;margin-top:24px">
        <el-button type="primary" size="large" @click="step = 2">下一步：选择产品 →</el-button>
      </div>
    </div>

    <!-- Step 2: Select Products -->
    <div v-if="step === 2" class="section-card">
      <h2>🎯 选择产品并上传照片</h2>
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <span class="text-light">共 {{ preview.products.length }} 个产品，已选 {{ selectedProducts.length }} 个</span>
        <el-button type="primary" link @click="toggleSelectAll">
          {{ selectedProducts.length === preview.products.length ? '取消全选' : '全选' }}
        </el-button>
      </div>
      <div class="product-select-grid">
        <div v-for="pid in preview.products" :key="pid"
          class="product-select-item" :class="{ selected: selectedProducts.includes(pid) }"
          @click="toggleProduct(pid)">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="pid">{{ pid }}</div>
            <el-tag v-if="selectedProducts.includes(pid)" type="success" size="small">已选</el-tag>
          </div>
          <div class="count">样本数：{{ preview.sample_counts[pid] }}</div>
          <el-tag v-if="preview.sample_counts[pid] < 200" type="warning" size="small" style="margin-top:6px">样本偏少</el-tag>

          <!-- Product Image Upload - always visible, click handled separately -->
          <div class="product-img-upload" @click="$event.stopPropagation()">
            <div v-if="productImagePreviews && productImagePreviews[pid]" class="product-img-preview">
              <img :src="productImagePreviews[pid]" />
              <div class="product-img-overlay" @click="removeProductImage(pid)">
                <span>✕ 移除</span>
              </div>
            </div>
            <div v-else class="product-img-dropzone" @click="openImagePicker(pid)">
              <span class="img-upload-icon">📷</span>
              <span class="img-upload-text">点击上传照片</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Shared hidden file input for product images -->
      <input ref="sharedImgInput" type="file" accept="image/*" style="position:absolute;visibility:hidden;width:0;height:0;" @change="onSharedImageChange">

      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;">
        <el-button size="large" @click="step = 1">← 上一步</el-button>
        <el-button type="primary" size="large" :disabled="selectedProducts.length === 0" :loading="uploadingImages" @click="goToConfirm">
          {{ uploadingImages ? '正在上传图片...' : '下一步：确认运行 →' }}
        </el-button>
      </div>
    </div>

    <!-- Step 3: Confirm & Run -->
    <div v-if="step === 3" class="section-card">
      <h2>⚡ 确认评价设置</h2>

      <el-descriptions :column="1" border style="margin-bottom:20px">
        <el-descriptions-item label="已选产品">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <span v-for="pid in selectedProducts" :key="pid"
              style="display:inline-flex;align-items:center;gap:4px;background:#f0f2ff;padding:4px 12px;border-radius:16px;font-size:13px;">
              <span v-if="productImagePreviews[pid]" style="color:#67c23a;">📷</span>
              <span v-else style="color:#ccc;">📷</span>
              {{ pid }}
            </span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="产品数量">{{ selectedProducts.length }} 个</el-descriptions-item>
        <el-descriptions-item label="已上传图片">{{ Object.keys(productImagePreviews).length }} 张</el-descriptions-item>
      </el-descriptions>

      <div style="margin-bottom:20px">
        <el-checkbox v-model="runLlm" size="large">
          🤖 启用 AI 消费者评论分析（调用通义千问大模型，每个产品额外消耗1次积分）
        </el-checkbox>
      </div>

      <div class="cost-preview">
        <h3 style="margin-bottom:12px;font-size:15px;">💰 费用预估</h3>
        <div class="cost-row">
          <span>评价计算（{{ selectedProducts.length }} 个产品）</span>
          <span>{{ selectedProducts.length }} 次</span>
        </div>
        <div class="cost-row" v-if="runLlm">
          <span>AI 评论分析</span>
          <span>{{ selectedProducts.length }} 次</span>
        </div>
        <div class="cost-row total">
          <span>总计消耗积分</span>
          <span>{{ totalCost }} 次</span>
        </div>
        <div class="cost-row">
          <span>当前余额</span>
          <span :style="{ color: userCredits >= totalCost ? '#67c23a' : '#f56c6c' }">{{ userCredits }} 次</span>
        </div>
      </div>

      <el-alert v-if="userCredits < totalCost" title="积分不足，请先充值或兑换优惠券" type="error" show-icon style="margin-top:12px" />

      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;">
        <el-button size="large" @click="step = 2">← 上一步</el-button>
        <el-button type="primary" size="large" :loading="running" :disabled="userCredits < totalCost" @click="runEvaluation">
          🚀 开始评价计算
        </el-button>
      </div>
    </div>

    <!-- Step 4: Running / Results -->
    <div v-if="step === 4 && running" class="section-card text-center">
      <el-progress type="circle" :percentage="runProgress" :width="120" :stroke-width="8" />
      <h3 style="margin-top:20px">正在计算中...</h3>
      <p class="text-light" style="margin-top:8px">{{ runStatusText }}</p>
    </div>

    <div v-if="step === 4 && !running && results.length > 0" class="section-card text-center">
      <div style="font-size:48px;margin-bottom:16px">🎉</div>
      <h2>评价计算完成！</h2>
      <p class="text-light" style="margin:12px 0 24px">共评价 {{ results.length }} 个产品，消耗 {{ results.length }} 次积分</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <el-button type="primary" size="large" @click="viewResults">📊 查看详细结果</el-button>
        <el-button size="large" @click="$router.push('/dashboard')">返回首页</el-button>
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
        ElementPlus.ElMessage.success('文件解析成功！');
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
          ElementPlus.ElMessage.success(`${imageEntries.length} 张产品图片已上传`);
        } catch (e) {
          ElementPlus.ElMessage.warning('图片上传失败：' + e.message + '，将跳过图片继续');
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
      runStatusText.value = '正在准备评价计算...';

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
        startProgressTimer(0, 20, 3000, '正在运行 Random Forest 算法计算创意度...');

        // Wait a moment then start phase 2
        await new Promise(r => setTimeout(r, 1500));

        if (runLlm.value) {
          // Phase 2: LLM analysis (20-85%, estimated based on product count)
          const estimatedMs = selectedProducts.value.length * 8000; // ~8s per product
          stopTimer();
          startProgressTimer(20, 85, estimatedMs, '正在调用 AI 分析消费者评论（这可能需要几分钟）...');
        } else {
          stopTimer();
          startProgressTimer(20, 85, 2000, '正在保存计算结果...');
        }

        const res = await evalApi.run(uploadId.value, {
          product_ids: selectedProducts.value,
          run_llm_analysis: runLlm.value,
        });

        // Phase 3: Complete
        stopTimer();
        runProgress.value = 100;
        runStatusText.value = '计算完成！';
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
      step, fileInput, filename, preview, warnings, uploadId, uploadProgress,
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
