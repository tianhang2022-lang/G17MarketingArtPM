/**
 * LAN 局域网实时同步模块
 * 仅在通过 Node.js 服务器（非 file:// 或 GitHub Pages）访问时激活
 *
 * 工作流程：
 *   保存数据 → POST /api/data → 服务器写文件 → SSE 广播 → 其他客户端收到通知 → 自动拉取并刷新
 */

const LanSync = {
  _enabled:    false,
  _es:         null,         // EventSource（SSE 连接）
  _saveTimer:  null,
  _lastHash:   '',
  INTERVAL:    15 * 1000,   // 15 秒自动推送一次（有变化才推送）

  // ── 检测是否在局域网服务器模式下运行
  isServerMode() {
    const proto = location.protocol;
    const host  = location.hostname;
    // file:// 协议 或 github.io 均为离线模式
    if (proto === 'file:') return false;
    if (host.endsWith('github.io')) return false;
    return true;
  },

  // ── 初始化（页面加载时调用）
  async init() {
    if (!this.isServerMode()) {
      console.log('[LanSync] 离线模式，局域网同步未激活');
      return;
    }

    // 验证 /api/sync-status 接口可达
    try {
      const r = await fetch('/api/sync-status');
      if (!r.ok) throw new Error();
      const st = await r.json();
      console.log('[LanSync] 局域网服务器检测到，激活实时同步', st);
      this._enabled = true;
    } catch(_) {
      console.log('[LanSync] 无法连接到 /api/sync-status，保持离线模式');
      return;
    }

    // 从服务器加载最新数据（优先于 localStorage）
    await this._loadFromServer();

    // 启动 SSE 实时推送监听
    this._connectSSE();

    // 启动定时自动保存
    this._startAutoSave();

    // 更新 Header 状态指示
    this._updateUI();
  },

  // ── 从服务器拉取数据
  async _loadFromServer() {
    try {
      const r = await fetch('/api/data');
      if (!r.ok) return;
      const data = await r.json();
      if (!data.versions) return; // 空数据，跳过
      DataManager.versions  = data.versions  || [];
      DataManager.materials = data.materials || [];
      DataManager.save(); // 同步到 localStorage 作为本地缓存
      console.log('[LanSync] 已从服务器加载数据');
      if (typeof renderCurrentPage === 'function') renderCurrentPage();
    } catch(e) {
      console.warn('[LanSync] 从服务器加载失败:', e.message);
    }
  },

  // ── 推送数据到服务器
  async saveToServer(silent = true) {
    if (!this._enabled) return;
    const data = {
      versions:  DataManager.versions,
      materials: DataManager.materials,
      savedAt:   new Date().toISOString(),
      savedBy:   (typeof Auth !== 'undefined') ? Auth.currentUser() : 'unknown',
    };
    const hash = `${data.versions.length}_${data.materials.length}_${data.versions.map(v=>v.id+v.progress).join('')}`;
    if (hash === this._lastHash) return; // 无变化
    this._lastHash = hash;

    try {
      const r = await fetch('/api/data', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      if (r.ok) {
        if (!silent) Utils.toast('✅ 已同步到局域网服务器', 'success');
        this._updateUI('synced');
        console.log('[LanSync] 数据已推送到服务器');
      }
    } catch(e) {
      console.warn('[LanSync] 推送失败:', e.message);
      this._updateUI('error');
    }
  },

  // ── SSE 实时推送（接收其他客户端的更新通知）
  _connectSSE() {
    if (this._es) { this._es.close(); }
    this._es = new EventSource('/api/events');

    this._es.addEventListener('connected', () => {
      console.log('[LanSync] SSE 已连接');
      this._updateUI();
    });

    // 有其他客户端修改了数据 → 自动拉取并刷新
    this._es.addEventListener('dataUpdated', async (e) => {
      const info = JSON.parse(e.data);
      // 如果是本机自己触发的，跳过（避免闪烁）
      const selfIP = await this._getSelfIP().catch(() => '');
      if (info.from && info.from.includes(location.hostname)) return;
      console.log('[LanSync] 收到更新通知，正在拉取…', info);
      await this._loadFromServer();
      this._showBadge(`🔄 ${info.from || '其他用户'} 刚刚同步了数据`);
    });

    this._es.onerror = () => {
      console.warn('[LanSync] SSE 连接断开，5秒后重连...');
      this._updateUI('error');
      setTimeout(() => this._connectSSE(), 5000);
    };
  },

  async _getSelfIP() {
    const r = await fetch('/api/sync-status');
    return (await r.json()).clients || '';
  },

  // ── 定时自动保存
  _startAutoSave() {
    if (this._saveTimer) clearInterval(this._saveTimer);
    this._saveTimer = setInterval(() => this.saveToServer(true), this.INTERVAL);
    // 页面关闭前推送
    window.addEventListener('beforeunload', () => this.saveToServer(true));
    // DataManager.save 钩子：每次本地保存后顺带推送到服务器
    const origSave = DataManager.save.bind(DataManager);
    DataManager.save = (...args) => {
      origSave(...args);
      this.saveToServer(true);
    };
  },

  // ── 更新 Header UI
  _updateUI(state) {
    const dot  = document.getElementById('syncDot');
    const text = document.getElementById('syncText');
    if (!this._enabled) return;
    if (dot) dot.className = 'sync-dot' + (state === 'error' ? ' error' : '');
    if (text) {
      if (state === 'synced') text.textContent = '🌐 局域网已同步';
      else if (state === 'error') text.textContent = '🌐 同步失败';
      else text.textContent = `🌐 局域网模式`;
    }
    // 显示在线人数
    fetch('/api/sync-status').then(r=>r.json()).then(s => {
      const el = document.getElementById('lanClientCount');
      if (el) el.textContent = `${s.clients || 1} 人在线`;
    }).catch(()=>{});
  },

  // ── 顶部临时提示
  _showBadge(msg) {
    const el = document.getElementById('autoSyncIndicator');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0.5'; }, 4000);
  },
};
