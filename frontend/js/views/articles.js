// Articles View
const ArticlesPage = {
  template: `
  <div>
    <div class="section-card">
      <h2>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        {{ t('art.title') }}
      </h2>
      <p class="text-light" style="margin-bottom:24px;font-size:14px">{{ t('art.desc') }}</p>

      <!-- Tag filter -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
        <span class="article-tag-filter" :class="{ 'article-tag-filter--active': activeTag === '' }" @click="activeTag = ''">{{ currentLang === 'zh' ? '全部' : 'All' }}</span>
        <span class="article-tag-filter" :class="{ 'article-tag-filter--active': activeTag === 'method' }" @click="activeTag = 'method'">{{ t('art.tag.method') }}</span>
        <span class="article-tag-filter" :class="{ 'article-tag-filter--active': activeTag === 'case' }" @click="activeTag = 'case'">{{ t('art.tag.case') }}</span>
        <span class="article-tag-filter" :class="{ 'article-tag-filter--active': activeTag === 'insight' }" @click="activeTag = 'insight'">{{ t('art.tag.insight') }}</span>
        <span class="article-tag-filter" :class="{ 'article-tag-filter--active': activeTag === 'tutorial' }" @click="activeTag = 'tutorial'">{{ t('art.tag.tutorial') }}</span>
      </div>

      <!-- Article list -->
      <div v-if="filteredArticles.length === 0" style="text-align:center;padding:60px 20px;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <p class="text-muted">{{ t('art.comingSoon') }}</p>
      </div>

      <div v-for="a in filteredArticles" :key="a.id" class="article-card" @click="openArticle(a)">
        <div class="article-card-header">
          <el-tag :type="tagType(a.tag)" size="small" style="border-radius:12px">{{ tagLabel(a.tag) }}</el-tag>
          <span class="article-card-date">{{ a.date }}</span>
        </div>
        <h3 class="article-card-title">{{ a.title }}<span v-if="a.pinned" class="news-pinned-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg> {{ currentLang === 'zh' ? '置顶' : 'Pinned' }}</span></h3>
        <p class="article-card-summary">{{ a.summary }}</p>
        <span class="article-card-more">{{ t('art.readMore') }} &rarr;</span>
      </div>

      <div v-if="filteredArticles.length > 0" style="text-align:center;padding:32px 20px;color:var(--text-muted);font-size:13px;">
        {{ t('art.comingSoon') }}
      </div>
    </div>

    <!-- Article detail dialog -->
    <Teleport to="body">
      <el-dialog v-model="showDetail" :title="selectedArticle?.title" width="720px" destroy-on-close top="5vh">
        <div v-if="selectedArticle" class="article-detail">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <el-tag :type="tagType(selectedArticle.tag)" size="small" style="border-radius:12px">{{ tagLabel(selectedArticle.tag) }}</el-tag>
            <span class="text-muted" style="font-size:13px">{{ selectedArticle.date }}</span>
          </div>
          <div class="article-detail-content" v-html="selectedArticle.content"></div>
        </div>
      </el-dialog>
    </Teleport>
  </div>
  `,
  setup() {
    const router = VueRouter.useRouter();
    const currentLang = Vue.ref(MuseCreaI18n.current);
    const activeTag = Vue.ref('');
    const showDetail = Vue.ref(false);
    const selectedArticle = Vue.ref(null);

    const isEn = MuseCreaI18n.current === 'en';

    const articles = Vue.ref([
      {
        id: 5,
        tag: 'tutorial',
        date: '2026-06-28',
        link: '/guide',
        pinned: true,
        title: isEn
          ? 'User Guide — How to Prepare Your Evaluation Data'
          : '使用指南 — 如何准备你的评价数据',
        summary: isEn
          ? 'Detailed guide to help you prepare Excel data and product images for accurate AI analysis.'
          : '详细指南帮助你准备 Excel 数据和产品图片，确保 AI 能够准确分析和评价你的文创产品。',
        content: isEn
          ? '<p>This guide covers everything you need to know about preparing your dataset for MuseCrea evaluation.</p><p>Learn the correct Excel format, image requirements, and best practices for getting accurate AI analysis results.</p>'
          : '<p>本指南涵盖了为 MuseCrea 评价准备数据集所需的一切知识。</p><p>了解正确的 Excel 格式、图片要求以及获得准确 AI 分析结果的最佳实践。</p>',
      },
      {
        id: 7,
        tag: 'method',
        date: '2025-10-01',
        link: null,
        pinned: false,
        title: isEn
          ? 'Data-efficient Creativity Evaluation in Museum Cultural Creative Products: A Machine Learning Framework'
          : '从复杂到高效：机器学习如何重新定义文创设计创意评估？',
        summary: isEn
          ? 'Published in Expert Systems with Applications (SCI Q1). A machine learning framework using Random Forest that accurately predicts creativity perception with only a few key indicators, even on small samples of 200–300 observations.'
          : '发表于 Expert Systems with Applications（SCI Q1 / 中科院一区Top）。提出基于随机森林的机器学习框架，仅保留少数关键指标即可准确预测消费者创意感知，即使在小样本（200–300条）条件下依然表现优异。',
        content: isEn
          ? '<p style="color:var(--primary);font-weight:600;margin-bottom:4px;">Hui Cheng<sup>a,b,c</sup>, Bing-jian Liu<sup>b</sup>, Xu Sun<sup>b,d</sup>, Xiao Qiu<sup>a</sup></p>'
            + '<p style="font-size:12px;color:var(--text-muted);margin-bottom:4px;line-height:1.6;"><sup>a</sup> Zhejiang University of Finance and Economics Dongfang College, China<br><sup>b</sup> Faculty of Science and Engineering, University of Nottingham Ningbo China, China<br><sup>c</sup> International School of Design, Ningbo Innovation Centre, Zhejiang University, China<br><sup>d</sup> Nottingham Ningbo China Beacons Institute, China</p>'
            + '<p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Expert Systems with Applications, Volume 297, Part A, 2026, 129014 &nbsp;|&nbsp; ISSN 0957-4174</p>'
            + '<img src="/img/article-eswa-cover.png" style="width:100%;border-radius:8px;margin-bottom:20px;" />'
            + '<p style="margin-bottom:16px;"><strong>Background &amp; Challenge.</strong> With the growing market, many cultural creative products suffer from homogeneity — cultural value is weakened and creative expression remains superficial. While the MPCM model offers a systematic evaluation framework, its 30+ indicators cause respondent fatigue and reduce accuracy. This raises a key question: can the model be simplified while remaining scientifically rigorous?</p>'
            + '<p style="margin-bottom:16px;"><strong>Literature Review.</strong> Museum Cultural Creative Products (MCCPs) carry both cultural communication and commercial value, so creativity evaluation must cover novelty, usefulness, emotional expression, aesthetics, and cultural value. The existing MPCM model covers these dimensions well, but lengthy questionnaires limit adoption. Prior work on scale simplification lacks systematic validation in the cultural creative domain.</p>'
            + '<p style="margin-bottom:16px;"><strong>Core Hypotheses.</strong> (1) The MPCM model can be simplified while maintaining high predictive accuracy; (2) Machine learning methods may outperform traditional models in prediction; (3) Optimized ML models can accurately predict creativity perception even with limited samples.</p>'
            + '<p style="margin-bottom:16px;"><strong>Methodology.</strong> A two-stage design was adopted. The exploration stage compared expert-based, hybrid, and ML-driven models to establish a simplified evaluation system. The in-depth stage benchmarked five mainstream algorithms — Random Forest (RF), GBDT, LightGBM, SVR, and XGBoost. A total of 17,853 reviews from 5,423 participants were collected across online and offline channels.</p>'
            + '<p style="margin-bottom:16px;"><strong>Results.</strong> ML models overall outperformed the traditional MPCM baseline. Random Forest showed stable and superior predictive performance across all sample sizes — notably, even with only 200–300 samples, it maintained low prediction error. This demonstrates that a small set of key indicators can accurately capture consumers\u2019 sense of creativity.</p>'
            + '<p style="margin-bottom:16px;"><strong>Contributions.</strong> Theoretically, the study proves that complex evaluation models can be effectively simplified and showcases the potential of data-driven methods in cultural creativity research. Practically, it provides museums and designers with a lightweight tool for rapid screening and optimization of creative designs.</p>'
            + '<p style="font-size:12px;color:var(--text-muted);border-top:1px solid var(--border-solid);padding-top:12px;margin-top:24px;"><strong>Funding:</strong> Zhejiang Provincial Philosophy and Social Science Planning Project (24SSHZ118YB), Hangzhou Philosophy and Social Science Planning Project (Z24JC027), Zhejiang Social Science Federation Research Project (2025N163), Zhejiang University of Finance &amp; Economics Dongfang College Key Project (2024DFYZD001).</p>'
            + '<p style="font-size:12px;color:var(--text-muted);">DOI: <a href="https://doi.org/10.1016/j.eswa.2025.129014" target="_blank" style="color:var(--primary)">10.1016/j.eswa.2025.129014</a></p>'
            + '<img src="/img/article-eswa-funding.png" style="width:100%;border-radius:8px;margin:20px 0;" />'
            + '<div style="margin-top:20px;"><a href="/templates/eswa-creativity-evaluation.pdf" download class="template-download-btn" style="display:inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Original PDF</a></div>'
          : '<p style="color:var(--primary);font-weight:600;margin-bottom:4px;">程辉<sup>a,b,c</sup>，刘炳建<sup>b</sup>，孙煦<sup>b,d</sup>，邱筱<sup>a</sup></p>'
            + '<p style="font-size:12px;color:var(--text-muted);margin-bottom:4px;line-height:1.6;"><sup>a</sup> 浙江财经大学东方学院<br><sup>b</sup> 宁波诺丁汉大学理工学院<br><sup>c</sup> 浙江大学国际设计学院（宁波创新中心）<br><sup>d</sup> 宁波诺丁汉中国灯塔研究院</p>'
            + '<p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Expert Systems with Applications, Volume 297, Part A, 2026, 129014 &nbsp;|&nbsp; ISSN 0957-4174 &nbsp;|&nbsp; <span style="color:var(--primary);">SCI Q1 / 中科院一区Top</span></p>'
            + '<img src="/img/article-eswa-cover.png" style="width:100%;border-radius:8px;margin-bottom:20px;" />'
            + '<p style="margin-bottom:16px;"><strong>引言</strong> &nbsp;随着文创市场的不断扩张，许多产品出现了"千篇一律"的现象——文化价值被弱化，创意表达流于表面。虽然 MPCM 模型提供了系统化的评估框架，但其包含 30 多个指标，导致消费者填写问卷时容易产生疲劳，从而影响结果的准确性。这一困境让我们不得不思考：能否在保持科学性的同时，让模型变得更简洁、更贴近实际应用？</p>'
            + '<p style="margin-bottom:16px;"><strong>文献综述</strong> &nbsp;博物馆文创产品（MCCPs）兼具文化传播和商业价值，因此创意评估不仅要考虑新颖性和实用性，还要涵盖情感表达、美学特质以及文化价值。现有的 MPCM 模型虽然能很好地覆盖这些维度，但冗长的问卷严重制约了它在博物馆和市场中的广泛使用。学界虽已有关于量表简化的探索，但在文创领域缺乏系统的验证。</p>'
            + '<p style="margin-bottom:16px;"><strong>核心假设</strong> &nbsp;（1）MPCM 模型可以在简化后仍保持较高的预测准确性；（2）机器学习方法有可能在预测效果上超越传统模型；（3）即使在样本数量有限的情况下，经过优化的机器学习模型依然能够准确预测消费者对创意的感知。</p>'
            + '<p style="margin-bottom:16px;"><strong>方法论</strong> &nbsp;文章采用双阶段研究设计。探索阶段比较了基于专家意见的模型、混合模型和机器学习驱动的模型，建立了简化后的评估体系。深入阶段引入了五种主流机器学习算法——随机森林（RF）、GBDT、LightGBM、SVR 和 XGBoost。研究共收集了 5,423 位参与者的 17,853 条评价数据，覆盖线上线下（社交媒体用户 + 博物馆现场游客）。</p>'
            + '<p style="margin-bottom:16px;"><strong>结果</strong> &nbsp;机器学习模型整体上表现优于传统 MPCM 标准模型。其中，随机森林（RF）在不同规模样本下均展现出稳定且优异的预测能力，特别是在 200–300 条的小样本条件下，依然能保持较低的预测误差。这说明即使只保留少数关键指标，模型依然可以准确捕捉消费者心中的"创意感"。</p>'
            + '<p style="margin-bottom:16px;"><strong>讨论与结论</strong> &nbsp;理论层面，本研究证明了复杂模型可以被有效简化，并展示了数据驱动方法在文化创意研究中的潜力。实践层面，为博物馆和设计师提供了一种更为轻便的工具，帮助快速筛选和优化创意设计，提升市场反应速度。展望未来，创意评估或许不再需要繁琐的问卷，而是能够通过图像识别等方式自动完成，让 AI 真正成为文化创新的助推器。</p>'
            + '<p style="font-size:12px;color:var(--text-muted);border-top:1px solid var(--border-solid);padding-top:12px;margin-top:24px;"><strong>资助信息：</strong>浙江省哲学社会科学规划"省市合作"课题（24SSHZ118YB）、杭州市哲学社会科学规划常规性课题（Z24JC027）、浙江省社会科学界联合会研究课题（2025N163）、浙江财经大学东方学院重点课题（2024DFYZD001）。</p>'
            + '<p style="font-size:12px;color:var(--text-muted);">DOI: <a href="https://doi.org/10.1016/j.eswa.2025.129014" target="_blank" style="color:var(--primary)">10.1016/j.eswa.2025.129014</a> &nbsp;|&nbsp; 中文版由 ChatGPT 5 翻译并总结，略去了图表等信息，请以英文原文为准。</p>'
            + '<img src="/img/article-eswa-funding.png" style="width:100%;border-radius:8px;margin:20px 0;" />'
            + '<div style="margin-top:20px;"><a href="/templates/eswa-creativity-evaluation.pdf" download class="template-download-btn" style="display:inline-flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 下载原文</a></div>',
      },
      {
        id: 1,
        tag: 'method',
        date: '2026-07-10',
        link: null,
        title: isEn
          ? 'Five-Dimensional Creativity Evaluation Framework'
          : '五维创意度评价框架：从美学到实用性的全面评估',
        summary: isEn
          ? 'Explore how MuseCrea evaluates creative products across Aesthetics, Novelty, Affect, Cultural Values, and Usefulness using Random Forest and LLM analysis.'
          : '探索 MuseCrea 如何通过设计美学、新颖性、情感性、文化价值和有用性五个维度，结合随机森林算法与 LLM 分析，全面评估文创产品的创意程度。',
        content: isEn
          ? '<p>The MuseCrea evaluation framework combines machine learning with large language model analysis to provide comprehensive creativity assessments.</p><p>Each dimension captures a unique aspect of creative product design, from visual aesthetics to practical usefulness in daily life.</p>'
          : '<p>MuseCrea 的评价框架结合了机器学习与大语言模型分析，提供全面的创意度评估。</p><p>每个维度捕捉创意产品设计的独特方面，从视觉美学到日常生活中的实用性。</p>',
      },
      {
        id: 2,
        tag: 'insight',
        date: '2026-07-05',
        link: null,
        title: isEn
          ? 'Consumer Perception Patterns in Cultural Creative Products'
          : '文创产品消费者感知模式分析',
        summary: isEn
          ? 'An analysis of how consumers perceive and evaluate cultural creative products, revealing key patterns in creativity perception.'
          : '分析消费者如何感知和评价文创产品，揭示创意感知的关键模式与影响因素。',
        content: isEn
          ? '<p>Through analyzing thousands of consumer reviews, we identified recurring patterns in how people evaluate cultural creative products.</p>'
          : '<p>通过分析数千条消费者评论，我们发现了人们评价文创产品时的反复出现的模式。</p>',
      },
      {
        id: 4,
        tag: 'insight',
        date: '2026-07-13',
        link: null,
        title: isEn
          ? 'V5 UI Redesign — Dark Theme + Vibrant Orange Style'
          : 'V5 界面改版上线 — 深色主题 + 橙色活力风格',
        summary: isEn
          ? 'Brand new dark interface with orange accent and gallery-style product showcase for a better visual experience.'
          : '全新设计的深色界面，橙色主色调搭配画廊式作品展示，带来更好的视觉体验。',
        content: isEn
          ? '<p>V5 brings a completely redesigned dark interface with vibrant orange as the primary accent color.</p><p>The new gallery-style product showcase provides a better visual experience for browsing and evaluating cultural creative products.</p>'
          : '<p>V5 带来了全面重构的深色界面，以活力橙色作为主色调。</p><p>全新的画廊式产品展示，为浏览和评价文创产品提供更好的视觉体验。</p>',
      },
      {
        id: 6,
        tag: 'insight',
        date: '2026-06-15',
        link: null,
        title: isEn
          ? 'Launched on Alibaba Cloud ECS — Officially Online'
          : '上线阿里云 ECS — 正式对外提供服务',
        summary: isEn
          ? 'MuseCrea deployed to Alibaba Cloud with HTTPS access at musecrea.shangmoves.design.'
          : 'MuseCrea 正式部署到阿里云，支持 HTTPS 安全访问，域名 musecrea.shangmoves.design。',
        content: isEn
          ? '<p>MuseCrea has been officially deployed to Alibaba Cloud ECS, providing stable and secure access via HTTPS.</p><p>Visit us at musecrea.shangmoves.design to start evaluating your cultural creative products.</p>'
          : '<p>MuseCrea 已正式部署到阿里云 ECS，通过 HTTPS 提供稳定安全的访问服务。</p><p>访问 musecrea.shangmoves.design 开始评价你的文创产品。</p>',
      },
    ]);

    const filteredArticles = Vue.computed(() => {
      if (!activeTag.value) return articles.value;
      return articles.value.filter(a => a.tag === activeTag.value);
    });

    const tagType = (tag) => {
      const map = { method: 'warning', case: 'success', insight: '', tutorial: 'danger' };
      return map[tag] || 'info';
    };

    const tagLabel = (tag) => t('art.tag.' + tag);

    const openArticle = (a) => {
      if (a.link) {
        if (a.link.startsWith('http')) {
          window.open(a.link, '_blank');
        } else {
          router.push(a.link);
        }
      } else {
        selectedArticle.value = a;
        showDetail.value = true;
      }
    };

    return { t, currentLang, activeTag, filteredArticles, tagType, tagLabel, showDetail, selectedArticle, openArticle };
  }
};
