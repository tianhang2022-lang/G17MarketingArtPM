// ==================== 自动保存 & 历史版本 ====================
const AutoSave = {
  HISTORY_KEY:  'g17_history',
  DRAFT_KEY:    'g17_draft',
  MAX_HISTORY:  20,        // 最多保留 20 条历史
  INTERVAL:     30 * 1000, // 每 30 秒自动保存一次
  _timer:       null,
  _lastHash:    '',        // 上次保存的数据摘要，避免无变化时写入

  // ── 启动自动保存定时器
  start() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._autoSave(), this.INTERVAL);
    // 页面关闭/离开时立即保存
    window.addEventListener('beforeunload', () => this._autoSave());
    // 用户任意操作后续期 session
    document.addEventListener('click',    () => Auth.refresh(), { passive: true });
    document.addEventListener('keydown',  () => Auth.refresh(), { passive: true });
    console.log('[AutoSave] 自动保存已启动，间隔 30s');
  },

  // ── 停止
  stop() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  },

  // ── 内部：执行一次自动保存
  _autoSave() {
    if (!DataManager.versions) return;
    const snapshot = { versions: DataManager.versions, materials: DataManager.materials };
    const hash = JSON.stringify(snapshot).length + '_' + (DataManager.versions.length) + '_' + (DataManager.materials.length);
    if (hash === this._lastHash) return; // 无变化，跳过
    this._lastHash = hash;
    this._saveSnapshot(snapshot, 'auto');
  },

  // ── 手动保存快照（可加 label）
  saveManual(label = '') {
    if (!DataManager.versions) return;
    const snapshot = { versions: DataManager.versions, materials: DataManager.materials };
    this._saveSnapshot(snapshot, 'manual', label);
    Utils.toast('✅ 手动快照已保存', 'success');
  },

  // ── 核心：保存一条历史记录
  _saveSnapshot(snapshot, type = 'auto', label = '') {
    const history = this.getHistory();
    const entry = {
      id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      time:      new Date().toISOString(),
      type,       // 'auto' | 'manual'
      label:     label || (type === 'auto' ? '自动保存' : '手动快照'),
      operator:  Auth.currentUser() || '未知',
      stats: {
        versions:  snapshot.versions.length,
        materials: snapshot.materials.length,
        done:      snapshot.materials.filter(m => m.status === 'done').length
      },
      data: snapshot   // 完整数据
    };

    // 追加到头部，超出最大条数则截断
    history.unshift(entry);
    if (history.length > this.MAX_HISTORY) history.splice(this.MAX_HISTORY);

    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      // 同步更新草稿
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify({ ...snapshot, savedAt: entry.time }));
    } catch (e) {
      // localStorage 空间不足时，删掉最旧的几条再试
      if (history.length > 5) {
        history.splice(5);
        try { localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history)); } catch(_) {}
      }
    }
    this._updateIndicator();
  },

  // ── 获取历史列表
  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]'); } catch(_) { return []; }
  },

  // ── 恢复某条历史
  restoreById(id) {
    const entry = this.getHistory().find(e => e.id === id);
    if (!entry) { Utils.toast('未找到该历史记录', 'error'); return; }
    if (!confirm(`确认恢复到「${entry.label}」（${new Date(entry.time).toLocaleString('zh-CN')}）？\n当前数据将被覆盖，建议先手动保存一次。`)) return;
    // 先把当前状态存一条"恢复前备份"
    this.saveManual('恢复前自动备份');
    DataManager.versions  = entry.data.versions  || [];
    DataManager.materials = entry.data.materials || [];
    DataManager.save();
    Utils.toast(`✅ 已恢复到「${entry.label}」`, 'success');
    setTimeout(() => { if (typeof renderCurrentPage === 'function') renderCurrentPage(); }, 200);
  },

  // ── 删除某条历史
  deleteById(id) {
    const history = this.getHistory().filter(e => e.id !== id);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    if (typeof AutoSave.openPanel === 'function') AutoSave._refreshPanel();
  },

  // ── 更新页面顶部的自动保存指示器
  _updateIndicator() {
    const el = document.getElementById('autoSaveIndicator');
    if (!el) return;
    const now = new Date();
    el.textContent = `💾 已自动保存 ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0.5'; }, 2000);
  },

  // ── 打开历史版本面板
  openPanel() {
    const existing = document.getElementById('historyPanel');
    if (existing) { existing.remove(); return; }
    const history = this.getHistory();

    const typeIcon  = { auto:'🔄', manual:'📌' };
    const rows = history.length ? history.map(e => `
      <tr>
        <td>
          <div style="font-weight:600;font-size:0.82rem">${typeIcon[e.type]||'💾'} ${e.label}</div>
          <div style="font-size:0.7rem;color:var(--gray-500);margin-top:0.1rem">${new Date(e.time).toLocaleString('zh-CN')}</div>
        </td>
        <td style="font-size:0.78rem;color:var(--gray-600)">${e.operator}</td>
        <td style="font-size:0.78rem">
          <span style="color:var(--primary)">${e.stats.versions}</span>版本 /
          <span style="color:var(--success)">${e.stats.done}</span>/${e.stats.materials}完成
        </td>
        <td>
          <div style="display:flex;gap:0.4rem">
            <button class="btn btn-sm" onclick="AutoSave.restoreById('${e.id}');AutoSave.openPanel()" style="font-size:0.72rem;padding:0.2rem 0.5rem">⏪ 恢复</button>
            <button class="btn btn-ghost btn-sm" onclick="AutoSave.deleteById('${e.id}');document.getElementById('historyPanelTbody').innerHTML=AutoSave._renderRows()" style="font-size:0.72rem;padding:0.2rem 0.4rem;color:var(--danger)">🗑</button>
          </div>
        </td>
      </tr>`) .join('') : `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray-400)">暂无历史记录</td></tr>`;

    const html = `
    <div class="modal-overlay active" id="historyPanel">
      <div class="modal-box" style="max-width:700px;max-height:80vh;display:flex;flex-direction:column">
        <div class="modal-head">
          <h2>🕘 历史版本</h2>
          <div style="display:flex;gap:0.5rem;margin-left:auto;align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="AutoSave.saveManual();AutoSave._refreshPanel()">📌 手动保存当前</button>
            <button class="modal-close" onclick="document.getElementById('historyPanel').remove()">×</button>
          </div>
        </div>
        <div class="modal-body" style="overflow-y:auto;padding-top:0">
          <div style="font-size:0.78rem;color:var(--gray-500);margin-bottom:0.75rem">
            最多保留 ${this.MAX_HISTORY} 条记录 · 每 30 秒自动保存一次 · 共 ${history.length} 条
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>快照描述</th><th>操作人</th><th>数据统计</th><th>操作</th></tr></thead>
              <tbody id="historyPanelTbody">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _renderRows() {
    const typeIcon = { auto:'🔄', manual:'📌' };
    const history  = this.getHistory();
    if (!history.length) return `<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray-400)">暂无历史记录</td></tr>`;
    return history.map(e => `
      <tr>
        <td>
          <div style="font-weight:600;font-size:0.82rem">${typeIcon[e.type]||'💾'} ${e.label}</div>
          <div style="font-size:0.7rem;color:var(--gray-500);margin-top:0.1rem">${new Date(e.time).toLocaleString('zh-CN')}</div>
        </td>
        <td style="font-size:0.78rem;color:var(--gray-600)">${e.operator}</td>
        <td style="font-size:0.78rem">
          <span style="color:var(--primary)">${e.stats.versions}</span>版本 /
          <span style="color:var(--success)">${e.stats.done}</span>/${e.stats.materials}完成
        </td>
        <td>
          <div style="display:flex;gap:0.4rem">
            <button class="btn btn-sm" onclick="AutoSave.restoreById('${e.id}');AutoSave.openPanel()" style="font-size:0.72rem;padding:0.2rem 0.5rem">⏪ 恢复</button>
            <button class="btn btn-ghost btn-sm" onclick="AutoSave.deleteById('${e.id}');document.getElementById('historyPanelTbody').innerHTML=AutoSave._renderRows()" style="font-size:0.72rem;padding:0.2rem 0.4rem;color:var(--danger)">🗑</button>
          </div>
        </td>
      </tr>`).join('');
  },

  _refreshPanel() {
    const tbody = document.getElementById('historyPanelTbody');
    if (tbody) tbody.innerHTML = this._renderRows();
  }
};
