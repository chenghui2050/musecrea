// Report View
const ReportPage = {
  template: `
  <div class="section-card">
    <h2>📄 评价报告</h2>
    <p class="text-light" style="margin-bottom:20px">查看和下载已生成的评价报告</p>
    <el-alert v-if="reportUrl" title="报告已生成" type="success" show-icon :closable="false">
      <template #default>
        <div style="margin-top:8px">
          <a :href="reportUrl" target="_blank" style="color:#667eea">🔗 在浏览器中查看完整报告</a>
          &nbsp;&nbsp;
          <a :href="downloadUrl" target="_blank" style="color:#667eea">📥 下载HTML报告</a>
        </div>
      </template>
    </el-alert>
    <div v-if="reportUrl" style="margin-top:20px">
      <iframe :src="reportUrl" style="width:100%;height:600px;border:1px solid #eee;border-radius:8px;"></iframe>
    </div>
    <div v-if="!reportUrl" class="text-center" style="padding:40px">
      <p class="text-light">请从历史评价记录中选择一个评价来生成报告</p>
      <el-button type="primary" style="margin-top:16px" @click="$router.push('/history')">查看历史</el-button>
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

    return { reportUrl, downloadUrl };
  }
};
