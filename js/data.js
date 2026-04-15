
// ==================== 星级素材预设模板 ====================
// 格式：{ name, type, count, priority, brief }
// type: design=美术设计类, interactive=网页H5素材, video=视频类素材
// count: 该星级所需数量（0=不需要）
const STAR_PRESETS = {
  5: [
    // ---- 美术设计类 ----
    { name: '版本主KV海报',   type: 'design',      count: 1, priority: 'high',   brief: '主视觉海报，不同尺寸版本，需体现版本核心主题，规格：2560×1440px、1080×1920px 各一版' },
    { name: '外观KV',         type: 'design',      count: 1, priority: 'high',   brief: '外观专属KV，2-3套，含竖版/方形，需适配各平台投放规格' },
    { name: '4+1商店图',      type: 'design',      count: 1, priority: 'high',   brief: '应用商店4张截图+1张特色图，月度更新，按各平台尺寸规范交付' },
    { name: '新服福利长图',   type: 'design',      count: 1, priority: 'medium', brief: '新服/开服福利活动长图，竖版，展示全部福利内容，适配微博/微信图文' },
    { name: '版本活动长图',   type: 'design',      count: 1, priority: 'high',   brief: '版本活动主题长图，竖版，含活动内容、玩法介绍、参与规则' },
    { name: '外观展示长图',   type: 'design',      count: 1, priority: 'medium', brief: '外观时装展示长图，包含多角度造型展示和属性说明' },
    { name: '外观GIF动图',    type: 'design',      count: 1, priority: 'high',   brief: '外观展示GIF动图，展示特效/动作，尺寸适配微博/微信，时长3-5秒' },
    { name: 'Icon图标',       type: 'design',      count: 1, priority: 'medium', brief: '版本/活动专属Icon图标，尺寸512×512px，适配iOS/Android规范，含圆角版' },
    { name: '新服图KV',       type: 'design',      count: 3, priority: 'high',   brief: '新服开服主视觉KV，需制作3套不同风格方案供选择，含横版和竖版' },
    // ---- 网页H5素材 ----
    { name: '版本专题页',     type: 'interactive', count: 1, priority: 'high',   brief: '版本核心专题页H5，含版本介绍、活动入口、外观展示等模块，适配PC+移动端' },
    { name: '版本FAB页',      type: 'interactive', count: 1, priority: 'medium', brief: '版本FAQ/FAB说明页，含常见问题解答、玩法说明，需响应式设计' },
    { name: '预约拉新H5',     type: 'interactive', count: 1, priority: 'high',   brief: '版本预约/拉新专项H5，含预约流程、奖励展示、分享功能' },
    { name: '互动H5',         type: 'interactive', count: 1, priority: 'medium', brief: '版本互动小游戏或测试H5，含交互逻辑和结果分享功能' },
    // ---- 视频类素材 ----
    { name: '版本CG',         type: 'video',       count: 1, priority: 'high',   brief: '版本核心CG动画，时长60-120s，横版16:9，含国语配音+字幕版和无字幕纯享版' },
    { name: '版本PV',         type: 'video',       count: 1, priority: 'high',   brief: '版本宣传PV，时长30-60s，竖版9:16+横版16:9双版本，含BGM和SFX' },
    { name: '福利快闪',       type: 'video',       count: 1, priority: 'high',   brief: '福利活动快闪视频，时长15-30s，竖版为主，节奏感强，适配抖音/快手投放' },
    { name: '版本前瞻',       type: 'video',       count: 1, priority: 'medium', brief: '版本内容前瞻视频，时长5-10分钟，横版直播切片格式，含字幕' },
    { name: '外观展示视频',   type: 'video',       count: 1, priority: 'medium', brief: '外观时装展示视频，时长15-30s，展示全部特效和动作，竖版9:16' },
    { name: '活动宣传片',     type: 'video',       count: 3, priority: 'high',   brief: '活动主题宣传片，需制作3个版本（长/中/短剪辑），时长分别约60s/30s/15s' },
    { name: '版本氛围视频',   type: 'video',       count: 3, priority: 'medium', brief: '版本氛围感宣传视频，3个不同风格版本，时长各15-30s，适配社媒投放' },
  ],
  4: [
    // ---- 美术设计类 ----
    { name: '版本主KV海报',   type: 'design',      count: 1, priority: 'high',   brief: '主视觉海报，规格：2560×1440px、1080×1920px 各一版' },
    { name: '外观KV',         type: 'design',      count: 1, priority: 'high',   brief: '外观专属KV，1-2套，含竖版/方形，适配主要平台' },
    { name: '4+1商店图',      type: 'design',      count: 1, priority: 'medium', brief: '应用商店4张截图+1张特色图，按平台规范交付' },
    { name: '新服福利长图',   type: 'design',      count: 1, priority: 'medium', brief: '新服福利长图，竖版，展示核心福利内容' },
    { name: '版本活动长图',   type: 'design',      count: 1, priority: 'high',   brief: '版本活动主题长图，竖版，含主要活动介绍' },
    { name: '外观展示长图',   type: 'design',      count: 1, priority: 'medium', brief: '外观展示长图，含主要角度展示' },
    { name: '外观GIF动图',    type: 'design',      count: 1, priority: 'medium', brief: '外观展示GIF，时长3-5秒，适配主要社媒平台' },
    { name: '新服图KV',       type: 'design',      count: 2, priority: 'high',   brief: '新服KV，需制作2套方案，含横版和竖版' },
    // ---- 网页H5素材 ----
    { name: '版本专题页',     type: 'interactive', count: 1, priority: 'high',   brief: '版本专题页H5，含核心版本信息和活动入口' },
    { name: '版本FAB页',      type: 'interactive', count: 1, priority: 'medium', brief: '版本FAQ页，含主要玩法说明' },
    { name: '预约拉新H5',     type: 'interactive', count: 1, priority: 'high',   brief: '预约拉新H5，含预约流程和奖励展示' },
    // ---- 视频类素材 ----
    { name: '版本CG',         type: 'video',       count: 1, priority: 'high',   brief: '版本CG动画，时长60s，横版16:9，含字幕版' },
    { name: '版本PV',         type: 'video',       count: 1, priority: 'high',   brief: '版本宣传PV，时长30s，竖版9:16' },
    { name: '福利快闪',       type: 'video',       count: 1, priority: 'high',   brief: '福利快闪视频，时长15s，竖版，适配短视频平台' },
    { name: '版本前瞻',       type: 'video',       count: 1, priority: 'medium', brief: '版本前瞻视频，时长3-5分钟，含字幕' },
    { name: '外观展示视频',   type: 'video',       count: 1, priority: 'medium', brief: '外观展示视频，时长15s，竖版9:16' },
    { name: '活动宣传片',     type: 'video',       count: 2, priority: 'high',   brief: '活动宣传片，2个版本（长/短剪辑），时长约30s/15s' },
    { name: '版本氛围视频',   type: 'video',       count: 2, priority: 'medium', brief: '版本氛围视频，2个风格版本，各15-30s' },
  ],
  3: [
    // ---- 美术设计类 ----
    { name: '版本主KV海报',   type: 'design',      count: 1, priority: 'high',   brief: '版本主KV，1080×1920px 竖版一版' },
    { name: '外观GIF动图',    type: 'design',      count: 1, priority: 'medium', brief: '外观展示GIF，时长3-5秒' },
    { name: '新服图KV',       type: 'design',      count: 1, priority: 'medium', brief: '新服KV，1套方案，含主要规格' },
    // ---- 视频类素材 ----
    { name: '福利快闪',       type: 'video',       count: 1, priority: 'medium', brief: '福利快闪，时长15s，竖版' },
    { name: '活动宣传片',     type: 'video',       count: 1, priority: 'high',   brief: '活动宣传片，1个版本，时长约15s' },
    { name: '版本氛围视频',   type: 'video',       count: 1, priority: 'medium', brief: '版本氛围视频，1个版本，时长15-30s' },
  ]
};

// ==================== 版本排期配置（按等级倒推） ====================
// 总周期：B=7天 A=14天 S=28天
// 三个阶段：前策期 → 制作期 → 执行期
// 三个节点：需求提交 | 素材提交 | 素材外放（=上线日）
const RANK_SCHEDULE = {
  S: {
    total: 28,
    phases: [
      { key: 'pre',    name: '前策期', days: 7,  color: '#8b5cf6' },
      { key: 'make',   name: '制作期', days: 14, color: '#3b82f6' },
      { key: 'exec',   name: '执行期', days: 7,  color: '#10b981' },
    ],
    milestones: [
      { key: 'req',     name: '需求提交', daysBeforeLaunch: 21, color: '#f59e0b', icon: '📋' },
      { key: 'submit',  name: '素材提交', daysBeforeLaunch: 7,  color: '#ef4444', icon: '📦' },
      { key: 'release', name: '素材外放', daysBeforeLaunch: 0,  color: '#10b981', icon: '🚀' },
    ]
  },
  A: {
    total: 14,
    phases: [
      { key: 'pre',    name: '前策期', days: 4,  color: '#8b5cf6' },
      { key: 'make',   name: '制作期', days: 6,  color: '#3b82f6' },
      { key: 'exec',   name: '执行期', days: 4,  color: '#10b981' },
    ],
    milestones: [
      { key: 'req',     name: '需求提交', daysBeforeLaunch: 10, color: '#f59e0b', icon: '📋' },
      { key: 'submit',  name: '素材提交', daysBeforeLaunch: 4,  color: '#ef4444', icon: '📦' },
      { key: 'release', name: '素材外放', daysBeforeLaunch: 0,  color: '#10b981', icon: '🚀' },
    ]
  },
  B: {
    total: 7,
    phases: [
      { key: 'pre',    name: '前策期', days: 2,  color: '#8b5cf6' },
      { key: 'make',   name: '制作期', days: 3,  color: '#3b82f6' },
      { key: 'exec',   name: '执行期', days: 2,  color: '#10b981' },
    ],
    milestones: [
      { key: 'req',     name: '需求提交', daysBeforeLaunch: 5, color: '#f59e0b', icon: '📋' },
      { key: 'submit',  name: '素材提交', daysBeforeLaunch: 2, color: '#ef4444', icon: '📦' },
      { key: 'release', name: '素材外放', daysBeforeLaunch: 0, color: '#10b981', icon: '🚀' },
    ]
  }
};

/**
 * 根据上线日期和版本等级，计算完整排期
 * @param {string} launchDate  - ISO 日期字符串 e.g. "2026-02-01"
 * @param {string} rank        - 'S' | 'A' | 'B'
 * @returns {{ startDate, phases:[{...start,end}], milestones:[{...date}] }}
 */
function calcVersionSchedule(launchDate, rank) {
  const launch = new Date(launchDate + 'T00:00:00');
  const cfg = RANK_SCHEDULE[rank] || RANK_SCHEDULE.B;

  // 倒推开始日
  const startDate = new Date(launch);
  startDate.setDate(startDate.getDate() - cfg.total);

  // 各阶段起止
  let cursor = new Date(startDate);
  const phases = cfg.phases.map(p => {
    const start = new Date(cursor);
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + p.days);
    return { ...p, start, end: new Date(cursor) };
  });

  // 各节点日期
  const milestones = cfg.milestones.map(m => {
    const d = new Date(launch);
    d.setDate(d.getDate() - m.daysBeforeLaunch);
    return { ...m, date: d };
  });

  return { startDate, launchDate: launch, phases, milestones, rank, total: cfg.total };
}

// ==================== 数据管理层 ====================
const DataManager = {
  versions: [],
  materials: [],
  templates: [],

  init() {
    this.versions  = JSON.parse(localStorage.getItem('dm_versions')  || '[]');
    this.materials = JSON.parse(localStorage.getItem('dm_materials') || '[]');
    this.templates = JSON.parse(localStorage.getItem('dm_templates') || '[]');
    // 首次加载时填充示例数据
    if (this.versions.length === 0) this._seed();
  },

  save() {
    localStorage.setItem('dm_versions',  JSON.stringify(this.versions));
    localStorage.setItem('dm_materials', JSON.stringify(this.materials));
    localStorage.setItem('dm_templates', JSON.stringify(this.templates));
  },

  // ---- 版本 CRUD ----
  addVersion(data) {
    const v = { id: Utils.uuid(), createdAt: new Date().toISOString(), progress: 0, ...data };
    this.versions.push(v);
    this.save();
    return v;
  },
  updateVersion(id, data) {
    const idx = this.versions.findIndex(v => v.id === id);
    if (idx < 0) return null;
    const old = this.versions[idx];
    // ── 进度历史：记录变化前的关键字段快照
    const LOG_FIELDS_V = ['progress','status','launchDate','note'];
    const hasChange = LOG_FIELDS_V.some(f => data[f] !== undefined && data[f] !== old[f]);
    if (hasChange) {
      const entry = {
        time: new Date().toISOString(),
        operator: (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser()) || '系统',
        progress: old.progress,
        status: old.status,
        launchDate: old.launchDate,
        note: old.note,
        // 记录新值，方便展示 diff
        _new: {
          progress: data.progress !== undefined ? data.progress : old.progress,
          status: data.status !== undefined ? data.status : old.status,
          launchDate: data.launchDate !== undefined ? data.launchDate : old.launchDate,
          note: data.note !== undefined ? data.note : old.note,
        }
      };
      const log = old.progressLog ? [...old.progressLog, entry] : [entry];
      data = { ...data, progressLog: log.slice(-50) };
    }
    this.versions[idx] = { ...old, ...data, updatedAt: new Date().toISOString() };
    this.save();
    return this.versions[idx];
  },
  deleteVersion(id) {
    this.versions = this.versions.filter(v => v.id !== id);
    this.materials = this.materials.filter(m => m.versionId !== id);
    this.save();
  },
  getVersion(id) { return this.versions.find(v => v.id === id); },

  // ---- 素材 CRUD ----
  addMaterial(data) {
    const m = { id: Utils.uuid(), createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(), files: [], comments: [], ...data };
    this.materials.push(m);
    this._recalcProgress(m.versionId);
    this.save();
    return m;
  },
  updateMaterial(id, data) {
    const idx = this.materials.findIndex(m => m.id === id);
    if (idx < 0) return null;
    const old = this.materials[idx];
    // ── 进度历史：记录变化前的关键字段快照
    const LOG_FIELDS_M = ['status','dueDate','note'];
    const hasChange = LOG_FIELDS_M.some(f => data[f] !== undefined && data[f] !== old[f]);
    if (hasChange) {
      const entry = {
        time: new Date().toISOString(),
        operator: (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser()) || '系统',
        status: old.status,
        dueDate: old.dueDate,
        note: old.note,
        // 记录新值
        _new: {
          status: data.status !== undefined ? data.status : old.status,
          dueDate: data.dueDate !== undefined ? data.dueDate : old.dueDate,
          note: data.note !== undefined ? data.note : old.note,
        }
      };
      const log = old.progressLog ? [...old.progressLog, entry] : [entry];
      data = { ...data, progressLog: log.slice(-50) };
    }
    this.materials[idx] = { ...old, ...data, updatedAt: new Date().toISOString() };
    this._recalcProgress(this.materials[idx].versionId);
    this.save();
    return this.materials[idx];
  },
  deleteMaterial(id) {
    const m = this.materials.find(x => x.id === id);
    const vid = m ? m.versionId : null;
    this.materials = this.materials.filter(x => x.id !== id);
    if (vid) this._recalcProgress(vid);
    this.save();
  },
  getMaterial(id) { return this.materials.find(m => m.id === id); },
  getMaterialsByVersion(vid) { return this.materials.filter(m => m.versionId === vid); },

  // ---- 评论 ----
  addComment(materialId, text, author = '当前用户') {
    const m = this.getMaterial(materialId);
    if (!m) return;
    if (!m.comments) m.comments = [];
    m.comments.push({ id: Utils.uuid(), author, text, time: new Date().toISOString() });
    m.updatedAt = new Date().toISOString();
    this.save();
  },

  // ---- 文件 ----
  addFile(materialId, fileRef) {
    const m = this.getMaterial(materialId);
    if (!m) return;
    if (!m.files) m.files = [];
    m.files.push(fileRef);
    m.updatedAt = new Date().toISOString();
    this.save();
  },
  deleteFile(materialId, fileId) {
    const m = this.getMaterial(materialId);
    if (!m || !m.files) return;
    m.files = m.files.filter(f => f.id !== fileId);
    m.updatedAt = new Date().toISOString();
    this.save();
  },

  // ---- 进度自动计算 ----
  _recalcProgress(versionId) {
    if (!versionId) return;
    const mats = this.getMaterialsByVersion(versionId);
    if (mats.length === 0) return;
    const done = mats.filter(m => m.status === 'done').length;
    this.updateVersion(versionId, { progress: Math.round(done / mats.length * 100) });
  },

  // ---- 导出 JSON ----
  exportJSON() {
    const data = { versions: this.versions, materials: this.materials, exportTime: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `art-schedule-${Date.now()}.json`;
    a.click();
  },

  // ---- 导入 JSON ----
  importJSON(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.versions)  this.versions  = data.versions;
    if (data.materials) this.materials = data.materials;
    this.save();
  },

  // ---- 导出 CSV ----
  exportCSV() {
    const header = ['素材名称','所属版本','类型','状态','负责人','优先级','截止日期','创建时间'];
    const rows = this.materials.map(m => {
      const v = this.getVersion(m.versionId);
      return [
        m.name, v ? v.name : '', Utils.typeLabel(m.type), Utils.statusLabel(m.status),
        m.assignee || '', Utils.priorityLabel(m.priority), m.dueDate || '',
        Utils.formatDate(m.createdAt)
      ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
    });
    const csv = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `art-schedule-${Date.now()}.csv`;
    a.click();
  },

  // ---- 强制重置为真实版本数据 ----
  clearAndSeed() {
    this.versions = [];
    this.materials = [];
    this.templates = [];
    this._seed();
    Utils.toast('✅ 已重置为 2026 版本规划数据', 'success');
  },

  // ---- 真实版本数据种子 ----
  _seed() {
    const TODAY = new Date('2026-04-13T00:00:00');

    // 辅助：根据上线日期推算版本状态
    const inferStatus = (launchDate) => {
      if (!launchDate) return 'planning';
      const ld = new Date(launchDate + 'T00:00:00');
      const diffDays = (ld - TODAY) / 86400000;
      if (diffDays < -1)  return 'done';
      if (diffDays <= 30) return 'in-progress';
      return 'planning';
    };

    // 辅助：从等级字符串提取 S/A/B
    const parseRank = (raw) => {
      if (!raw) return 'B';
      const r = raw.trim().toUpperCase();
      if (r.startsWith('S')) return 'S';
      if (r.startsWith('A')) return 'A';
      return 'B';
    };

    // 2026 完整版本规划
    const VERSIONS = [
      {
        name: '2026春节（节日活动＆促销）',
        rawRank: 'S-促活付费',
        category: '节日活动', subCategory: '促活付费',
        marketingOwner: '于洋', planningOwner: '周雨东',
        launchDate: '2026-02-06',
        description: '春节重磅版本，含节日活动与促销专项，促活付费方向'
      },
      {
        name: '38届群雄（新增交易服＆资格赛）',
        rawRank: 'B',
        category: '竞技赛事', subCategory: '',
        marketingOwner: '罗威', planningOwner: '沈杰',
        launchDate: '',
        description: '新增交易服及资格赛玩法'
      },
      {
        name: '马年生肖服',
        rawRank: 'A-新增回流',
        category: '新增回流', subCategory: '新增回流',
        marketingOwner: '程梦寐', planningOwner: '肖嘉鑫',
        launchDate: '2026-03-04',
        description: '马年主题生肖专属服装，回流活动主打'
      },
      {
        name: '女神节（活动＆特卖·绍兴剧团联动）',
        rawRank: 'A',
        category: '节日活动', subCategory: '大话东方行IP联动',
        marketingOwner: '于洋', planningOwner: '高倩囡、孙骞',
        launchDate: '2026-03-08',
        description: '三八女神节活动与特卖，联动绍兴剧团"大话东方行"IP'
      },
      {
        name: '御兽争锋S2调整',
        rawRank: 'B',
        category: '赛事活动', subCategory: '',
        marketingOwner: '陈晓宇', planningOwner: '徐炤圆',
        launchDate: '2026-04-11',
        description: '御兽争锋第二赛季玩法调整优化'
      },
      {
        name: '春日福利季（回流·新服·以旧换新·公益植树）',
        rawRank: 'A-新增回流',
        category: '新增回流', subCategory: '新增回流',
        marketingOwner: '陈晓宇', planningOwner: '沈文睿、百战',
        launchDate: '2026-04-17',
        description: '春日回流活动+新服开放+以旧换新+公益植树联动活动'
      },
      {
        name: '召唤兽比斗争霸赛',
        rawRank: 'A',
        category: '竞技赛事', subCategory: '',
        marketingOwner: '罗威', planningOwner: '宁瀚',
        launchDate: '2026-03-18',
        description: '召唤兽竞技比斗赛季赛事'
      },
      {
        name: '2026上半年套装资料片（双套装·护身符·新魔王窟·战斗跳字）',
        rawRank: 'S-促活付费',
        category: '资料片', subCategory: '促活付费，魔王窟A-新增回流',
        marketingOwner: '程梦寐', planningOwner: '柳雨春、程广权、宁瀚、金芙蓉、范一鸣',
        launchDate: '2026-04-15',
        description: '上半年核心资料片：双套装+护身符+战斗跳字系统+新魔王窟'
      },
      {
        name: '五一活动·广州艺术博物馆联动·大话令新赛季',
        rawRank: 'A',
        category: '节日活动', subCategory: '大话东方行IP联动',
        marketingOwner: '于洋', planningOwner: '周轩、张晟林',
        launchDate: '2026-04-22',
        description: '五一节日活动+广州艺术博物馆荔枝联动+大话令新赛季'
      },
      {
        name: '520恋爱主题服',
        rawRank: 'A-新增回流',
        category: '新增回流', subCategory: '新增回流',
        marketingOwner: '程梦寐', planningOwner: '陈炎',
        launchDate: '2026-05-19',
        description: '520主题恋爱向新服，回流方向'
      },
      {
        name: '520促销+六一活动（布老虎非遗文旅联动）',
        rawRank: 'A',
        category: '节日活动', subCategory: '大话东方行IP联动',
        marketingOwner: '王文闻', planningOwner: '任子彤、胡泽华',
        launchDate: '2026-05-18',
        description: '520促销专项+六一玩法活动，布老虎非遗文旅联动（待定）'
      },
      {
        name: '暑期活动（玩法活动·促销·养生服）',
        rawRank: 'S-新增回流',
        category: '新增回流', subCategory: '新增回流',
        marketingOwner: '于洋', planningOwner: '肖嘉鑫、李晶、苏瑾',
        launchDate: '2026-06-25',
        description: '暑期核心版本：玩法活动+促销+养生主题新服'
      },
      {
        name: '新周末活动',
        rawRank: 'A',
        category: '玩法活动', subCategory: '',
        marketingOwner: '王文闻', planningOwner: '李剑平、范一鸣、郑邦瑜',
        launchDate: '2026-07-09',
        description: '全新周末常规活动玩法'
      },
      {
        name: '群雄巅峰赛',
        rawRank: 'A',
        category: '竞技赛事', subCategory: '',
        marketingOwner: '罗威', planningOwner: '沈杰',
        launchDate: '2026-06-11',
        description: '群雄争霸赛事巅峰赛季'
      },
      {
        name: '传世时装第二套',
        rawRank: 'B',
        category: '时装活动', subCategory: '',
        marketingOwner: '王文闻', planningOwner: '孙骞',
        launchDate: '2026-06-24',
        description: '传世系列第二套主题时装上线'
      },
      {
        name: '2026鎏金宝鉴·汕头文旅功夫茶联动',
        rawRank: 'S-促活付费',
        category: 'IP联动', subCategory: '促活付费，大话东方行',
        marketingOwner: '陈晓宇', planningOwner: '刘洋、芙蓉',
        launchDate: '2026-07-17',
        description: '鎏金宝鉴活动+汕头文旅功夫茶联动，促活付费方向'
      },
      {
        name: '无差别挑战赛',
        rawRank: 'A',
        category: '竞技赛事', subCategory: '',
        marketingOwner: '罗威', planningOwner: '冯尧成',
        launchDate: '2026-08-17',
        description: '全新无差别等级挑战赛模式'
      },
      {
        name: '嘉年华（线下·山西非遗联动·珍稀神兽·小西天副本）',
        rawRank: 'S-促活付费＆回流',
        category: '嘉年华', subCategory: '促活付费＆回流',
        marketingOwner: '程梦寐', planningOwner: '周轩、范一鸣、陈炎、胡泽华、芙蓉、苏瑾、徐炤圆',
        launchDate: '2026-08-17',
        description: '年度嘉年华：线下活动+山西非遗联动+珍稀神兽+小西天副本'
      },
      {
        name: '七夕活动＆促销（绍兴越剧团联动）',
        rawRank: 'B',
        category: '节日活动', subCategory: '大话东方行IP联动',
        marketingOwner: '王文闻', planningOwner: '樊志浩、张晟林',
        launchDate: '2026-08-17',
        description: '七夕节日活动+促销专项，联动绍兴越剧团IP'
      },
      {
        name: '手游周年庆（活动·新服·促销）',
        rawRank: 'S-新增回流',
        category: '周年庆', subCategory: '新增回流',
        marketingOwner: '于洋', planningOwner: '沈文睿、徐炤圆、任子彤、孙骞、刘文旭',
        launchDate: '2026-09-14',
        description: '手游年度周年庆：周年庆活动+新服开放+大促销售'
      },
      {
        name: '侠侣争锋赛',
        rawRank: 'B',
        category: '竞技赛事', subCategory: '',
        marketingOwner: '罗威', planningOwner: '冯尧成',
        launchDate: '2026-10-30',
        description: '侠侣双人竞技争锋赛季'
      },
      {
        name: '双十一促销＆联动',
        rawRank: 'S-促活付费',
        category: '大促销售', subCategory: '促活付费',
        marketingOwner: '于洋', planningOwner: '周轩、任子彤、范一鸣',
        launchDate: '2026-10-30',
        description: '双十一年度大促+品牌联动，促活付费核心节点'
      },
      {
        name: '下半年资料片（帮派系统）',
        rawRank: 'S-促活/回流（待定）',
        category: '资料片', subCategory: '促活/回流（待定）',
        marketingOwner: '待定', planningOwner: '待定',
        launchDate: '2026-11-11',
        description: '下半年核心资料片，帮派系统重做，方向待定'
      },
      {
        name: '2027数字新服',
        rawRank: 'S-新增回流',
        category: '新增回流', subCategory: '新增回流',
        marketingOwner: '待定', planningOwner: '待定',
        launchDate: '2026-12-31',
        description: '2027年度首服，数字主题新服开放'
      },
      {
        name: '2027双旦·长春长白山文旅联动',
        rawRank: 'B',
        category: '节日活动', subCategory: '大话东方行IP联动',
        marketingOwner: '待定', planningOwner: '待定',
        launchDate: '2026-12-31',
        description: '元旦+圣诞双旦活动，长春长白山文旅联动"大话东方行"'
      },
    ];

    // 随机素材状态生成器（根据版本状态）
    const randMatStatus = (vStatus) => {
      if (vStatus === 'done') return 'done';
      if (vStatus === 'in-progress') {
        const r = Math.random();
        if (r < 0.25) return 'done';
        if (r < 0.55) return 'in-progress';
        if (r < 0.75) return 'review';
        return 'todo';
      }
      return 'todo';
    };

    VERSIONS.forEach(vData => {
      const rank   = parseRank(vData.rawRank);
      const status = inferStatus(vData.launchDate);
      const priority = rank === 'S' ? '最高' : rank === 'A' ? '高' : '中';

      const v = this.addVersion({
        name: vData.name,
        rank,
        category: vData.category,
        subCategory: vData.subCategory,
        description: vData.description,
        marketingOwner: vData.marketingOwner,
        planningOwner: vData.planningOwner,
        launchDate: vData.launchDate || '',
        status,
        priority,
      });

      // 按等级选择预设（S→5星，A→4星，B→3星）
      const starLevel = rank === 'S' ? 5 : rank === 'A' ? 4 : 3;
      const presets   = STAR_PRESETS[starLevel] || [];

      // 计算素材截止日（按排期倒推到"素材提交"节点）
      let matDueDate = '';
      if (vData.launchDate) {
        try {
          const sched  = calcVersionSchedule(vData.launchDate, rank);
          const submit = sched.milestones.find(m => m.key === 'submit');
          if (submit) matDueDate = submit.date.toISOString().slice(0, 10);
        } catch(e) {}
      }

      presets.forEach(item => {
        const cnt = Math.max(1, parseInt(item.count) || 1);
        for (let n = 1; n <= cnt; n++) {
          this.addMaterial({
            name:     cnt > 1 ? `${item.name} (${n}/${cnt})` : item.name,
            type:     item.type,
            priority: item.priority || 'medium',
            brief:    item.brief   || '',
            status:   randMatStatus(status),
            assignee: vData.marketingOwner !== '待定' ? vData.marketingOwner : '',
            dueDate:  matDueDate,
            versionId: v.id,
          });
        }
      });
    });
  }
};
