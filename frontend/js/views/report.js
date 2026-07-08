// Report View
const ReportPage = {
  template: `
  <div class="section-card">
    <h2>📄 {{ t('report.title') }}</h2>
    <p class="text-light" style="margin-bottom:20px">{{ t('report.desc') }}</p>
    <el-alert v-if="reportUrl" :title="t('report.generated')" type="success" show-icon :closable="false">
      <template #default>
        <div style="margin-top:8px">
          <a :href="reportUrl" target="_blank" style="color:#667eea">🔗 {{ t('report.viewInBrowser') }}</a>
          &nbsp;&nbsp;
          <a :href="downloadUrl" target="_blank" style="color:#667eea">📥 {{ t('report.downloadPdf') }}</a>
        </div>
      </template>
    </el-alert>
    <div v-if="reportUrl" style="margin-top:20px">
      <iframe :src="reportUrl" style="width:100%;height:600px;border:1px solid #eee;border-radius:8px;"></iframe>
    </div>
    <div v-if="!reportUrl" class="text-center" style="padding:40px">
      <p class="text-light">{{ t('report.noReport') }}</p>
      <el-button type="primary" style="margin-top:16px" @click="$router.push('/history')">{{ t('report.viewHistory') }}</el-button>
    </div>
  </div>
  `,
  setup() {
    const route = VueRouter.useRoute();
    const reportUrl = Vue.ref('');
    const downloadUrl = Vue.ref('');

    Vue.onMounted(() => {
      const evalId = route.params.id || route.query.id;
      if (evalId) {
        reportUrl.value = reportApi.generate(evalId);
        downloadUrl.value = reportApi.download(evalId);
      }
    });

    return { t, reportUrl, downloadUrl };
  }
};
