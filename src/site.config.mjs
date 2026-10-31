/**
 * 光谱档案 / Spectrum Archive
 * 站点配置：所有页面、导航与元数据集中在这里。
 * 这是构建脚本与内容页的唯一事实来源。
 */

export const site = {
  name: '光谱档案',
  nameEn: 'Spectrum Archive',
  title: '光谱档案 · LGBTQ+ 中文资料站',
  description:
    '一个不收集隐私、无第三方脚本、支持明暗主题与响应式阅读的 LGBTQ+ 中文资料站：身份图谱、中国跨性别现状、权益、健康、支持、资源、新闻与一键部署。',
  baseUrl: 'https://elysianki4225-png.github.io/LGBTQ',
  repo: 'https://github.com/elysianki4225-png/LGBTQ',
  repoLabel: 'elysianki4225-png/LGBTQ',
  demo: 'https://elysianki4225-png.github.io/LGBTQ/',
  issues: 'https://github.com/elysianki4225-png/LGBTQ/issues',
  discussions: 'https://github.com/elysianki4225-png/LGBTQ/discussions',
  securityAdvisories:
    'https://github.com/elysianki4225-png/LGBTQ/security/advisories/new',
  licenseCode: 'MIT',
  licenseContent: 'CC BY-SA 4.0',
  updated: '2026-10-31',
  updatedLabel: '2026 年 10 月 31 日',
  locale: 'zh-CN',
  themeColorLight: '#FDF7FF',
  themeColorDark: '#141218',
  ogImage: '/assets/img/og.png',
  keywords: [
    'LGBTQ',
    'LGBT',
    '跨性别',
    '非二元性别',
    '间性人',
    '中国跨性别',
    '性别认同',
    '性倾向',
    '性别肯定医疗',
    '反歧视',
    '隐私优先',
    '静态网站',
    'Material Design 3',
  ],
};

/**
 * 页面顺序同时决定：页头导航分组、上一页/下一页、站点地图顺序。
 * slug 为空字符串表示首页。
 */
export const pages = [
  {
    slug: '',
    file: 'index.html',
    nav: '首页',
    group: 'primary',
    title: '一个不收集隐私的 LGBTQ+ 中文资料站',
    heading: '每一个身份，都值得被看见。',
    eyebrow: '光谱档案 · Spectrum Archive',
    lede:
      '这里有一份尽量完整、尽量可核查、尽量不冒犯的中文资料：身份图谱、中国跨性别现状、权利与医疗、支持路径、历史与资源。它不追踪你，不向你收费，也不要求你登录。',
    description:
      '不收集隐私、无 Cookie、无第三方脚本的 LGBTQ+ 中文资料站。涵盖全部性少数身份、中国跨性别与性少数现状、权益、健康、支持、历史、新闻与资源，支持明暗主题、响应式阅读和服务器一键部署。',
    keywords: ['LGBTQ 中文', '跨性别', '中国跨性别现状', '隐私优先', '静态网站'],
    customHero: true,
    toc: false,
  },
  {
    slug: 'identities',
    file: 'identities.html',
    nav: '身份图谱',
    main: true,
    group: 'primary',
    title: '身份图谱：性别、性倾向与浪漫倾向',
    heading: '身份不是单选题，也不是标签考试。',
    eyebrow: '从零开始',
    lede:
      'L、G、B、T、Q、I、A、+ 不是一串需要背诵的字母，而是许多人在寻找自己时使用过的语言。本页把性别认同、性别表达、指派性别、性倾向与浪漫倾向拆开讲清楚，也解释那些常被混淆或误用的词。',
    description:
      '系统解释 LGBTQIA+ 身份：女同性恋、男同性恋、双性恋、跨性别、酷儿、间性人、无性恋、非二元性别、性别流动、浪漫倾向，以及性别认同与性倾向的区别。',
    keywords: ['LGBTQIA 含义', '跨性别', '非二元性别', '间性人', '无性恋', '性别认同'],
    toc: true,
  },
  {
    slug: 'china',
    file: 'china.html',
    nav: '中国现状',
    main: true,
    group: 'primary',
    title: '中国跨性别与性少数现状',
    heading: '在法条、病历、家庭与网络之间。',
    eyebrow: '中国现场',
    lede:
      '这一页不把中国写成单一故事。它分开呈现法律文本、行政实践、司法个案、医学规范、社群调查与国际报道，并明确每一条信息的来源与局限。你既能看到制度性的门槛，也能看到正在发生的改变。',
    description:
      '中国跨性别现状长文：1997 年非罪化、2001 年去病理化、2022 年性别重置技术规范、身份证性别变更、扭转治疗、就业歧视、家庭压力、审查与司法个案，含数据、时间线与来源。',
    keywords: ['中国跨性别现状', '跨性别权益', '身份证性别变更', '扭转治疗', '2022 性别重置规范'],
    toc: true,
  },
  {
    slug: 'rights',
    file: 'rights.html',
    nav: '权益',
    main: true,
    group: 'primary',
    title: '权益：法律承认、反歧视与公共议题',
    heading: '权利不是特权，而是同一条起跑线。',
    eyebrow: '法律与公共政策',
    lede:
      '从国际人权框架到各国国内法，从婚姻平等到法定性别承认，从反歧视诉讼到转换治疗禁令，本页解释不同制度如何设计，也把支持与批评双方的理由放在同一张桌上。',
    description:
      'LGBTQ+ 权益与法律指南：联合国人权框架、法定性别承认的四种模式、婚姻平等、反歧视法、转换治疗禁令、体育与单性别空间、青少年医疗争议，以及 13 个司法辖区的比较。',
    keywords: ['LGBTQ 权益', '法定性别承认', '婚姻平等', '反歧视法', '转换治疗'],
    toc: true,
  },
  {
    slug: 'health',
    file: 'health.html',
    nav: '健康',
    main: true,
    group: 'primary',
    title: '健康：性别肯定医疗与身心健康',
    heading: '医疗应该减少痛苦，而不是审判身份。',
    eyebrow: '循证与安全',
    lede:
      '本页整理性别肯定医疗的基础知识、HRT 与手术的收益和风险、心理支持、性与生殖健康，以及中国语境下的就医现实。它不提供处方或剂量，也不能替代医生；它希望帮助你在信息更充分的情况下做决定。',
    description:
      '跨性别健康指南：ICD-11 性别不一致、WPATH SOC-8、HRT 基础与监测、性别肯定手术、心理支持、转换治疗的危害、青少年医疗争议、性与生殖健康、中国就医现实。',
    keywords: ['跨性别医疗', 'HRT', '性别肯定手术', 'WPATH', '跨性别健康'],
    toc: true,
  },
  {
    slug: 'support',
    file: 'support.html',
    nav: '支持',
    main: true,
    group: 'primary',
    title: '支持：危机、出柜与现实生活',
    heading: '先活下来，再慢慢往前走。',
    eyebrow: '给正在经历的人',
    lede:
      '如果你正在危机中、准备出柜、被家人施压、遭遇暴力，或只是不知道下一步怎么办，这一页把能立刻使用的步骤、可拨打的电话和可参考的经验放在一起。没有标准答案，安全永远优先。',
    description:
      'LGBTQ+ 支持指南：危机热线 12356、出柜决策、家庭压力、强制治疗、校园与职场、亲密关系暴力、住房与金钱、线上安全、自我照顾，以及给亲友的建议。',
    keywords: ['LGBTQ 支持', '出柜', '危机热线', '12356', '跨性别求助'],
    toc: true,
  },
  {
    slug: 'ally',
    file: 'ally.html',
    nav: '盟友',
    group: 'more',
    title: '盟友：把支持变成具体行动',
    heading: '盟友不是头衔，是一组可以练习的行为。',
    eyebrow: '给亲友、同事与旁观者',
    lede:
      '支持不是转发一条口号，而是在听到错误称呼时开口、在表格上多留一个选项、在有人被围攻时不走开。本页提供家庭、学校、职场、医疗与线上场景的具体做法，也列出那些看似好意却会造成伤害的行为。',
    description:
      '如何成为 LGBTQ+ 盟友：称呼与代词、出柜隐私、家庭沟通、校园与职场包容、医疗友好、线上反骚扰、打断歧视的话术、常见错误与道歉方式。',
    keywords: ['LGBTQ 盟友', '如何支持跨性别', '代词', '职场包容', '校园反欺凌'],
    toc: true,
  },
  {
    slug: 'history',
    file: 'history.html',
    nav: '历史',
    group: 'more',
    title: '历史：从石墙之前到算法时代',
    heading: '历史不是一条直线，而是一张被反复涂改的地图。',
    eyebrow: '记忆与脉络',
    lede:
      '今天被视为“传统”的性别秩序，本身也只有很短的历史；今天被视为“新潮”的多元性别，在许多文化里早已存在。本页按时间梳理全球与中国的重要节点，并解释旗帜、纪念日与那些常被简化的故事。',
    description:
      'LGBTQ+ 与跨性别历史：全球时间线、中国 1997 非罪化与 2001 去病理化、金星的公开经历、台湾与日本与泰国与尼泊尔的节点、骄傲旗与跨性别旗、纪念日、历史争议。',
    keywords: ['LGBTQ 历史', '跨性别历史', '石墙', '骄傲旗', '中国 LGBT 历史'],
    toc: true,
  },
  {
    slug: 'data',
    file: 'data.html',
    nav: '数据',
    group: 'more',
    title: '数据：数字能说明什么，不能说明什么',
    heading: '每一个百分比背后，都是一个具体的人。',
    eyebrow: '证据与局限',
    lede:
      '本页把常被引用的数字放回它们的研究设计、样本与语境中：2021 年全国跨性别健康调查、人口估算、全球法律统计。我们同时标出这些数字不能证明什么，避免用一张图代替一整个群体。',
    description:
      '跨性别与 LGBTQ+ 数据：2021 全国跨性别健康调查 7625 份样本、抑郁焦虑与自杀风险、就业与校园歧视、人口估算、ILGA 2026 全球法律数据、统计阅读方法与数据缺口。',
    keywords: ['跨性别数据', '2021 全国跨性别健康调查', 'LGBTQ 统计', 'ILGA', '人口估算'],
    toc: true,
  },
  {
    slug: 'news',
    file: 'news.html',
    nav: '新闻',
    group: 'more',
    title: '新闻与事实核查：慢一点，先核对',
    heading: '新闻不是事实本身，转发也不是行动。',
    eyebrow: '更新与核查',
    lede:
      '本页记录 2024 至 2026 年与中国及全球 LGBTQ+ 相关的重要节点，区分“已确认”“有争议”“仅见转载”。我们不追求速度，也不把未经核实的截图当作判决书。',
    description:
      'LGBTQ+ 新闻与事实核查：2024 灵儿扭转治疗案、2026 最高人民法院研究室回函报道、微信封禁、Pride 月审查、泰国婚姻平等、俄罗斯禁令、ILGA 2026 数据、媒体素养。',
    keywords: ['LGBTQ 新闻', '中国跨性别新闻', '事实核查', '灵儿案', '最高人民法院'],
    toc: true,
  },
  {
    slug: 'resources',
    file: 'resources.html',
    nav: '资源',
    group: 'primary',
    title: '资源目录：可以继续读下去的地方',
    heading: '好资源不一定热闹，但应该可核查。',
    eyebrow: '索引与导航',
    lede:
      '这里收录中文百科、医疗指南、法律文本、新闻机构、社群组织与国际资源。每条都标注语言、类型、适用场景与注意事项。外部链接不会在页面里加载，只有你点击时才会离开本站。',
    description:
      'LGBTQ+ 中文资源导航：Wikipedia、MtF.wiki、FtM.wiki、跨性别在线、Project Trans、WPATH、ILGA、UN OHCHR、澎湃、HRW、社群组织、危机热线、X/Twitter 账号与筛选标准。',
    keywords: ['LGBTQ 资源', 'MtF.wiki', '跨性别资源', 'LGBTQ 组织', '危机热线'],
    toc: true,
  },
  {
    slug: 'glossary',
    file: 'glossary.html',
    nav: '词汇表',
    group: 'more',
    title: '词汇表：从指派性别到交叉性',
    heading: '词是工具，不是判决。',
    eyebrow: '语言与定义',
    lede:
      '同一词在不同社群、语言与年代里可能有不同含义。本页给出常见中文与英文术语的工作定义、使用提示和争议说明；当一个人告诉你 ta 希望被怎样称呼时，那比词典更重要。',
    description:
      'LGBTQ+ 与跨性别词汇表：指派性别、性别认同、性别表达、跨性别、非二元、间性人、无性恋、浪漫倾向、HRT、性别肯定手术、转换治疗、交叉性、少数群体压力等 80 余条。',
    keywords: ['LGBTQ 词汇', '跨性别术语', '性别认同定义', '非二元', '间性人'],
    toc: true,
  },
  {
    slug: 'security',
    file: 'security.html',
    nav: '安全',
    group: 'primary',
    title: '安全与隐私：我们做什么，不做什么',
    heading: '不收集，是我们能写进代码里的承诺。',
    eyebrow: '隐私与威胁模型',
    lede:
      '本站没有账户、没有表单、没有 Cookie、没有分析工具、没有第三方脚本。但“绝对安全”不是任何网站能给出的保证。本页公开我们的技术措施、数据边界、仍然存在的风险，以及高风险使用者可以怎样保护自己。',
    description:
      '网站安全与隐私说明：零收集、零 Cookie、零第三方请求、CSP 与 Trusted Types、GitHub Pages 的日志边界、主题本地存储、无内存泄漏设计、威胁模型、高风险使用者数字安全清单。',
    keywords: ['隐私优先', '网站安全', 'CSP', '零收集', 'LGBTQ 数字安全'],
    toc: true,
  },
  {
    slug: 'deploy',
    file: 'deploy.html',
    nav: '部署',
    group: 'primary',
    title: '部署：GitHub Pages 与服务器一键安装',
    heading: '把这份档案，放到你自己的域名下。',
    eyebrow: '开源与自托管',
    lede:
      '站点是纯静态的：可以放在 GitHub Pages，也可以用一条命令部署到自己的服务器。支持 Let’s Encrypt 自动证书、自有证书，以及没有域名时使用 nip.io。所有脚本都公开，可先读再运行。',
    description:
      '一键部署 LGBTQ+ 静态网站：GitHub Pages 在线体验、Ubuntu/Debian 一键安装脚本、Nginx、Let’s Encrypt、自有证书、nip.io、安全响应头、无访问日志、验证与排错。',
    keywords: ['静态网站部署', 'GitHub Pages', '一键部署', 'Nginx', "Let's Encrypt", 'nip.io'],
    toc: true,
  },
  {
    slug: 'faq',
    file: 'faq.html',
    nav: '常见问题',
    group: 'more',
    title: '常见问题：把争论拆成可以回答的问题',
    heading: '先问清楚，再站队。',
    eyebrow: '问答',
    lede:
      '同性恋是不是病？跨性别一定要手术吗？中国能改身份证吗？孩子出柜怎么办？青少年医疗、体育、单性别空间为什么争得这么厉害？本页用简短回答和延伸阅读，处理最常被问到的问题。',
    description:
      'LGBTQ+ 常见问题：同性恋与跨性别去病理化、非二元、间性人、性倾向能否改变、转换治疗、中国婚姻与证件、HRT、青少年医疗、体育争议、言论自由、网站隐私与部署。',
    keywords: ['LGBTQ 常见问题', '跨性别 FAQ', '同性恋是病吗', '跨性别手术', '出柜'],
    toc: true,
  },
  {
    slug: 'about',
    file: 'about.html',
    nav: '关于',
    group: 'more',
    title: '关于光谱档案：原则、方法与 AI 声明',
    heading: '一份由 AI 辅助构建、但愿意被持续纠错的档案。',
    eyebrow: '关于本项目',
    lede:
      '光谱档案是一个非官方、非营利的社区资料项目。它不隶属于任何政党、宗教、国家机构或商业公司。本页说明我们的编辑原则、AI 参与方式、技术栈、可访问性目标、许可与联系方式。',
    description:
      '关于光谱档案：项目使命、中立与事实核查原则、AI 辅助构建声明、技术栈、可访问性、性能预算、许可、联系方式、更新日志与免责声明。',
    keywords: ['光谱档案', 'AI 构建', '开源 LGBTQ 网站', '编辑原则', 'Material Design 3'],
    toc: true,
  },
  {
    slug: 'search',
    file: 'search.html',
    nav: '搜索',
    group: 'hidden',
    title: '站内搜索',
    heading: '在本地搜索，不把问题交给服务器。',
    eyebrow: '站内搜索',
    lede:
      '输入关键词，结果在你的浏览器里匹配。搜索词不会发送到任何服务器，也不会写进网址、Cookie 或分析工具。首次输入时才会下载一份静态索引。',
    description: '光谱档案站内搜索：本地匹配、不上传查询、无追踪。',
    keywords: ['站内搜索'],
    noindex: true,
    toc: false,
    customHero: true,
    pageJs: 'search.js',
  },
];

export const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

export const navGroups = [
  {
    id: 'primary',
    label: '主要页面',
    items: pages.filter((page) => page.group === 'primary'),
  },
  {
    id: 'more',
    label: '更多内容',
    items: pages.filter((page) => page.group === 'more'),
  },
];
