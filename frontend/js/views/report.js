// Report View
const ReportPage = {
  template: `
  <div class="section-card">
    <h2><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span> {{ t('report.title') }}</h2>
    <p class="text-light" style="margin-bottom:20px">{{ t('report.desc') }}</p>
    <el-alert v-if="reportUrl" :title="t('report.generated')" type="success" show-icon :closable="false">
      <template #default>
        <div style="margin-top:8px">
          <a :href="reportUrl" target="_blank" class="report-link"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span> {{ t('report.viewInBrowser') }}</a>
          &nbsp;&nbsp;
          <a :href="downloadUrl" target="_blank" class="report-link"><span style="display:inline-flex;align-items:center;vertical-align:middle;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg></span> {{ t('report.downloadPdf') }}</a>
        </div>
      </template>
    </el-alert>
    <div v-if="reportUrl" style="margin-top:20px">
      <iframe :src="reportUrl" class="report-iframe"></iframe>
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
      const id = route.params.id || route.query.id;
      if (id) {
        reportUrl.value = reportApi.generate(id);
        downloadUrl.value = reportApi.download(id);
      }
    });

    return { t, reportUrl, downloadUrl };
  }
};
