// Image Library Modal Component
const ImageLibraryModal = {
  template: `
  <el-dialog v-model="visible" :title="t('imglib.title')" width="800px" :close-on-click-modal="false" @close="handleClose">
    <div class="img-lib-container">
      <!-- Upload Area -->
      <div class="img-lib-upload" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
        <div v-if="uploading" style="text-align:center">
          <el-progress type="circle" :percentage="uploadProgress" :width="60" />
          <p class="text-muted" style="margin-top:8px;font-size:13px">{{ t('imglib.uploading') }}</p>
        </div>
        <div v-else style="text-align:center;padding:20px">
          <div style="font-size:36px;margin-bottom:8px"><span class="px-icon px-icon-xl px-upload"></span></div>
          <p class="text-light" style="font-size:14px">{{ t('imglib.dropzone') }}</p>
          <p class="text-muted" style="font-size:12px;margin-top:4px">{{ t('imglib.formats') }}</p>
          <div style="margin-top:12px;display:flex;justify-content:center;gap:8px;align-items:center;" @click.stop>
            <el-input v-model="uploadProductId" :placeholder="t('imglib.productIdPlaceholder')" size="small" style="width:200px" clearable />
          </div>
        </div>
        <input ref="uploadInput" type="file" accept="image/*" multiple style="display:none" @change="handleFileSelect">
      </div>

      <!-- Folder Info Hint -->
      <div style="margin:12px 0;">
        <div class="imglib-tips-toggle" @click="showTips = !showTips">
          {{ t('imglib.tipsToggle') }}
          <svg v-if="showTips" width="10" height="10" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" style="vertical-align:middle"><rect x="3" y="2" width="2" height="1"/><rect x="2" y="3" width="4" height="1"/><rect x="1" y="4" width="6" height="1"/><rect x="0" y="5" width="8" height="1"/></svg>
          <svg v-else width="10" height="10" viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" style="vertical-align:middle"><rect x="0" y="2" width="8" height="1"/><rect x="1" y="3" width="6" height="1"/><rect x="2" y="4" width="4" height="1"/><rect x="3" y="5" width="2" height="1"/></svg>
        </div>
        <div v-if="showTips" class="imglib-tips-content">
          <p><strong>{{ t('imglib.tipDirectTitle') }}</strong> — {{ t('imglib.tipDirectDesc') }}</p>
          <p><strong>{{ t('imglib.tipFolderTitle') }}</strong> — {{ t('imglib.tipFolderDesc') }}</p>
          <div v-if="folderPath" class="imglib-folder-path">
            <span class="px-icon px-folder"></span> {{ folderPath }}
          </div>
          <p style="margin-top:6px">{{ t('imglib.tipNaming') }}</p>
          <p>{{ t('imglib.tipFormats') }}</p>
          <p v-if="!folderExists" style="color:#f7d51d;margin-top:6px">{{ t('imglib.tipNoFolder') }}</p>
          <p v-else style="color:#92cc41;margin-top:6px">{{ t('imglib.tipFolderReady') }} {{ images.length }} {{ t('imglib.tipImageCount') }}</p>
        </div>
      </div>

      <!-- Image Grid -->
      <div v-if="loading" style="text-align:center;padding:40px">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="images.length === 0" class="text-muted" style="text-align:center;padding:40px">
        <div style="font-size:48px;margin-bottom:12px"><span class="px-icon px-icon-xl px-museum"></span></div>
        <p>{{ t('imglib.empty') }}</p>
      </div>
      <div v-else class="img-lib-grid">
        <div v-for="img in images" :key="img.filename" class="img-lib-item" :class="{'img-lib-assigned-item': img.assigned_to}">
          <div class="img-lib-thumb">
            <img :src="cacheBust(img.url)" :alt="img.product_id" />
          </div>
          <div class="img-lib-info">
            <div class="img-lib-name">{{ img.product_id }}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
              <span class="img-lib-meta">{{ img.size_text }}</span>
              <el-tag v-if="img.assigned_to" size="small" type="success">{{ t('imglib.assigned') }} {{ img.assigned_to }}</el-tag>
            </div>
          </div>
          <div class="img-lib-actions">
            <template v-if="!img.assigned_to">
              <div v-if="assigningPid === img.filename" style="display:flex;gap:4px;align-items:center;">
                <el-input v-model="inlinePid" :placeholder="t('imglib.productIdInput')" size="small" style="width:80px" @keyup.enter="quickAssign(img)" />
                <el-button type="primary" size="small" link @click.stop="quickAssign(img)" :loading="assigningImage === img.filename">{{ t('imglib.confirm') }}</el-button>
                <el-button size="small" link @click.stop="assigningPid = null">{{ t('imglib.cancel') }}</el-button>
              </div>
              <el-button v-else type="primary" size="small" link @click.stop="startInlineAssign(img)">{{ t('imglib.assign') }}</el-button>
            </template>
            <template v-else>
              <div v-if="assigningPid === img.filename" style="display:flex;gap:4px;align-items:center;">
                <el-input v-model="inlinePid" :placeholder="t('imglib.productIdInput')" size="small" style="width:80px" @keyup.enter="quickAssign(img)" />
                <el-button type="primary" size="small" link @click.stop="quickAssign(img)" :loading="assigningImage === img.filename">{{ t('imglib.confirm') }}</el-button>
                <el-button size="small" link @click.stop="assigningPid = null">{{ t('imglib.cancel') }}</el-button>
              </div>
              <template v-else>
                <el-button type="primary" size="small" link @click.stop="startInlineAssign(img)">{{ t('imglib.reassign') }}</el-button>
                <el-button type="warning" size="small" link @click.stop="unassignImage(img)" :loading="unassigningImage === img.filename">{{ t('imglib.unassign') }}</el-button>
              </template>
            </template>
            <el-button type="danger" size="small" link @click.stop="confirmDelete(img)" :loading="deletingImage === img.filename">
              {{ t('imglib.delete') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('imglib.close') }}</el-button>
      <el-button type="primary" @click="$emit('refresh')" v-if="hasChanges">{{ t('imglib.refresh') }}</el-button>
    </template>
  </el-dialog>
  `,

  props: {
    modelValue: { type: Boolean, default: false },
    targetProductId: { type: String, default: null },
  },

  emits: ['update:modelValue', 'refresh', 'assigned'],

  setup(props, { emit }) {
    const visible = Vue.computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    });

    const images = Vue.ref([]);
    const loading = Vue.ref(false);
    const uploading = Vue.ref(false);
    const uploadProgress = Vue.ref(0);
    const assigningImage = Vue.ref(null);
    const deletingImage = Vue.ref(null);
    const unassigningImage = Vue.ref(null);
    const hasChanges = Vue.ref(false);
    const uploadInput = Vue.ref(null);
    const assigningPid = Vue.ref(null);
    const inlinePid = Vue.ref('');
    const uploadProductId = Vue.ref('');
    const folderExists = Vue.ref(true);
    const folderPath = Vue.ref('');
    const showTips = Vue.ref(false);

    const loadImages = async () => {
      loading.value = true;
      try {
        const res = await uploadApi.getLibrary();
        images.value = (res && res.images) || [];
        folderExists.value = res ? res.folder_exists !== false : true;
        folderPath.value = (res && res.folder_path) || '';
        // Debug: check P3/P4/P5
        const debugImgs = images.value.filter(i => i.filename.startsWith('P3') || i.filename.startsWith('P4') || i.filename.startsWith('P5'));
        if (debugImgs.length > 0) {
          console.log('[ImageLibrary] P3/P4/P5 data:', debugImgs.map(i => ({filename: i.filename, assigned_to: i.assigned_to})));
        }
      } catch (e) {
        ElementPlus.ElMessage.error(t('imglib.loadFailed') + ': ' + e.message);
      } finally {
        loading.value = false;
      }
    };

    const triggerUpload = () => {
      uploadInput.value?.click();
    };

    const handleFileSelect = async (e) => {
      const files = e.target.files;
      if (!files.length) return;
      for (const file of files) {
        await uploadSingleImage(file);
      }
      e.target.value = '';
    };

    const handleDrop = async (e) => {
      const files = e.dataTransfer.files;
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await uploadSingleImage(file);
        }
      }
    };

    const uploadSingleImage = async (file) => {
      uploading.value = true;
      uploadProgress.value = 10;
      try {
        uploadProgress.value = 50;
        const pid = uploadProductId.value.trim() || null;
        await uploadApi.uploadToLibrary(file, pid);
        uploadProgress.value = 100;
        hasChanges.value = true;
        const msg = pid ? file.name + t('imglib.uploadedAndAssignedTo') + pid : file.name + t('imglib.uploadedToLib');
        ElementPlus.ElMessage.success(msg);
        if (pid) {
          emit('assigned', { productId: pid, imageUrl: `/uploads/images/${file.name}` });
        }
        await loadImages();
        await Vue.nextTick();
      } catch (e) {
        ElementPlus.ElMessage.error(t('imglib.uploadFailed') + ': ' + e.message);
      } finally {
        uploading.value = false;
        uploadProgress.value = 0;
      }
    };

    const startInlineAssign = (img) => {
      assigningPid.value = img.filename;
      inlinePid.value = img.product_id || '';
    };

    const quickAssign = async (img) => {
      const pid = inlinePid.value.trim();
      if (!pid) {
        ElementPlus.ElMessage.warning(t('imglib.enterProductId'));
        return;
      }
      assigningImage.value = img.filename;
      try {
        await uploadApi.assignImage(img.filename, pid);
        hasChanges.value = true;
        ElementPlus.ElMessage.success(t('imglib.assignSuccessPrefix') + img.filename + t('imglib.assignSuccessTo') + pid);
        emit('assigned', { productId: pid, imageUrl: img.url });
        assigningPid.value = null;
        inlinePid.value = '';
        await loadImages();
      } catch (e) {
        ElementPlus.ElMessage.error(t('imglib.assignFailed') + ': ' + e.message);
      } finally {
        assigningImage.value = null;
      }
    };

    const unassignImage = async (img) => {
      unassigningImage.value = img.filename;
      try {
        await uploadApi.unassignImage(img.filename);
        hasChanges.value = true;
        ElementPlus.ElMessage.success(t('imglib.unassignSuccessPrefix') + img.filename);
        emit('refresh');
        await loadImages();
      } catch (e) {
        ElementPlus.ElMessage.error(t('imglib.unassignFailed') + ': ' + e.message);
      } finally {
        unassigningImage.value = null;
      }
    };

    const confirmDelete = (img) => {
      ElementPlus.ElMessageBox.confirm(
        t('imglib.confirmDeletePrefix') + img.filename + t('imglib.confirmDeleteSuffix'),
        t('imglib.confirmDeleteTitle'),
        { type: 'warning', confirmButtonText: t('imglib.delete'), cancelButtonText: t('imglib.cancel'), confirmButtonClass: 'el-button--danger' }
      ).then(() => doDelete(img)).catch(() => {});
    };

    const doDelete = async (img) => {
      deletingImage.value = img.filename;
      try {
        await uploadApi.deleteImage(img.filename);
        hasChanges.value = true;
        ElementPlus.ElMessage.success(t('imglib.deletedPrefix') + img.filename);
        await loadImages();
      } catch (e) {
        ElementPlus.ElMessage.error(t('imglib.deleteFailed') + ': ' + e.message);
      } finally {
        deletingImage.value = null;
      }
    };

    const getExt = (filename) => {
      const dot = filename.lastIndexOf('.');
      return dot >= 0 ? filename.substring(dot) : '';
    };

    const handleClose = () => {
      if (hasChanges.value) {
        emit('refresh');
      }
    };

    const cacheBust = (url) => {
      if (!url) return url;
      return url + '?t=' + Date.now();
    };

    Vue.watch(visible, (val) => {
      if (val) {
        hasChanges.value = false;
        loadImages();
      }
    });

    return {
      visible, images, loading, uploading, uploadProgress,
      assigningImage, deletingImage, unassigningImage,
      hasChanges, uploadInput, assigningPid, inlinePid, uploadProductId,
      folderExists, folderPath, showTips,
      triggerUpload, handleFileSelect, handleDrop,
      confirmDelete, getExt, handleClose, loadImages, cacheBust,
      startInlineAssign, quickAssign, unassignImage, t,
    };
  }
};
