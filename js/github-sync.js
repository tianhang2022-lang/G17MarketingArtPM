// ==================== GitHub 同步 ====================
const GitHubSync = {
  get token()  { return localStorage.getItem('gh_token') || ''; },
  get repo()   { return localStorage.getItem('gh_repo')  || ''; },
  get autoOn() { return localStorage.getItem('gh_auto_sync') === '1'; },
  branch: 'main',

  // 自动同步定时器
  _autoTimer: null,
  _autoIntervalMs: 5 * 60 * 1000,   // 默认 5 分钟
  _lastDataHash: '',                  // 用于检测数据是否有变化

  // ─────────────────────────────────────────────────────
  // 配置面板（替换 prompt 为漂亮弹窗）
  configure() {
    const existing = document.getElementById('ghConfigModal');
    if (existing) { existing.remove(); return; }

    const intervals = [
      { v: '5',  l: '5 分钟' },
      { v: '10', l: '10 分钟' },
      { v: '15', l: '15 分钟' },
      { v: '30', l: '30 分钟' },
      { v: '60', l: '1 小时' },
    ];
    const savedMin = Math.round((parseInt(localStorage.getItem('gh_auto_interval')||'300') / 60));

    const html = `
    <div class="modal-overlay active" id="ghConfigModal">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-head">
          <h2>⚙️ GitHub 同步配置</h2>
          <button class="modal-close" onclick="document.getElementById('ghConfigModal').remove()">×</button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:1rem">

          <div class="form-group">
            <label class="form-label">Personal Access Token</label>
            <div style="position:relative">
              <input class="form-control" id="ghToken" type="password" placeholder="ghp_xxxxxxxxxxxx"
                value="${this.token}" style="padding-right:2.5rem">
              <button type="button" onclick="const i=document.getElementById('ghToken');i.type=i.type==='password'?'text':'password'"
                style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem">👁</button>
            </div>
            <div style="font-size:0.72rem;color:var(--gray-400);margin-top:0.25rem">
              前往 <a href="https://github.com/settings/tokens/new" target="_blank" style="color:var(--primary)">GitHub → Settings → Tokens</a> 生成，勾选 repo 权限
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">仓库地址</label>
            <input class="form-control" id="ghRepo" placeholder="用户名/仓库名" value="${this.repo}">
            <div style="font-size:0.72rem;color:var(--gray-400);margin-top:0.25rem">格式：tianhang2022-lang/G17MarketingArtPM</div>
          </div>

          <div style="background:var(--gray-50);border-radius:0.75rem;padding:1rem;border:1px solid var(--gray-200)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
              <span style="font-weight:600;font-size:0.875rem">🔄 自动同步</span>
              <label class="toggle-switch">
                <input type="checkbox" id="ghAutoToggle" ${this.autoOn ? 'checked' : ''}
                  onchange="document.getElementById('ghAutoInterval').disabled=!this.checked">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:0.8rem;color:var(--gray-600)">同步间隔</span>
              <select class="form-control" id="ghAutoInterval" style="max-width:130px" ${!this.autoOn?'disabled':''}>
                ${intervals.map(i => `<option value="${i.v}" ${savedMin==i.v?'selected':''}>${i.l}</option>`).join('')}
              </select>
              <span style="font-size:0.72rem;color:var(--gray-400)">（有数据变化时才上传）</span>
            </div>
          </div>

          <!-- 同步状态 -->
          <div id="ghConfigStatus" style="font-size:0.8rem;color:var(--gray-500);min-height:1.5rem"></div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="document.getElementById('ghConfigModal').remove()">取消</button>
          <button class="btn btn-ghost btn-sm" onclick="GitHubSync._testConnection()">🔍 测试连接</button>
          <button class="btn" onclick="GitHubSync._saveConfig()">💾 保存并应用</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  _testConnection() {
    const token = document.getElementById('ghToken').value.trim();
    const repo  = document.getElementById('ghRepo').value.trim();
    const st    = document.getElementById('ghConfigStatus');
    if (!token || !repo) { st.innerHTML = '<span style="color:#ef4444">⚠ 请填写 Token 和仓库地址</span>'; return; }
    st.textContent = '🔍 连接测试中...';
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    }).then(r => {
      if (r.ok) st.innerHTML = '<span style="color:#10b981">✅ 连接成功，仓库可访问</span>';
      else      st.innerHTML = `<span style="color:#ef4444">❌ 连接失败 (${r.status})，请检查 Token 和仓库名</span>`;
    }).catch(() => st.innerHTML = '<span style="color:#ef4444">❌ 网络错误，无法访问 GitHub</span>');
  },

  _saveConfig() {
    const token    = document.getElementById('ghToken').value.trim();
    const repo     = document.getElementById('ghRepo').value.trim();
    const autoOn   = document.getElementById('ghAutoToggle').checked;
    const interval = parseInt(document.getElementById('ghAutoInterval').value) * 60 * 1000;
    if (!token || !repo) { Utils.toast('Token 和仓库地址不能为空', 'error'); return; }
    localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_repo',  repo);
    localStorage.setItem('gh_auto_sync', autoOn ? '1' : '0');
    localStorage.setItem('gh_auto_interval', String(interval));
    this._autoIntervalMs = interval;
    document.getElementById('ghConfigModal').remove();
    this.updateStatusUI();
    Utils.toast('GitHub 配置已保存', 'success');
    // 重新启停自动同步
    if (autoOn) this.startAutoSync();
    else        this.stopAutoSync();
  },

  // ─────────────────────────────────────────────────────
  // 自动同步
  startAutoSync() {
    this.stopAutoSync();
    if (!this.token || !this.repo) return;
    const ms = parseInt(localStorage.getItem('gh_auto_interval') || '300000');
    this._autoIntervalMs = ms;
    this._autoTimer = setInterval(() => this._autoSyncOnce(), ms);
    this._updateAutoIndicator(true);
    console.log(`[GitHubSync] 自动同步已启动，间隔 ${ms/60000} 分钟`);
  },

  stopAutoSync() {
    if (this._autoTimer) { clearInterval(this._autoTimer); this._autoTimer = null; }
    this._updateAutoIndicator(false);
  },

  async _autoSyncOnce() {
    if (!this.token || !this.repo) return;
    // 检测数据是否有变化（用长度 + 内容摘要）
    const snapshot = JSON.stringify({ v: DataManager.versions?.length, m: DataManager.materials?.length,
      vH: DataManager.versions?.map(x=>x.id+x.progress).join(',') });
    if (snapshot === this._lastDataHash) {
      console.log('[GitHubSync] 数据无变化，跳过自动同步');
      this._updateAutoIndicator(true, '数据无变化');
      return;
    }
    this._lastDataHash = snapshot;
    console.log('[GitHubSync] 检测到数据变化，开始自动同步...');
    this._updateAutoIndicator(true, '同步中…');
    await this.push(true); // silent = true 不弹 toast，只更新指示器
  },

  // ─────────────────────────────────────────────────────
  // 推送
  async push(silent = false) {
    if (!this.token || !this.repo) {
      if (!silent && confirm('GitHub 未配置，是否立即配置？')) this.configure();
      return;
    }
    this.updateStatusUI('syncing');
    try {
      const data    = { versions: DataManager.versions, materials: DataManager.materials, savedAt: new Date().toISOString() };
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      let sha = null;
      try {
        const r = await fetch(`https://api.github.com/repos/${this.repo}/contents/data.json`,
          { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } });
        if (r.ok) sha = (await r.json()).sha;
      } catch (_) {}

      const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/data.json`, {
        method: 'PUT',
        headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: silent
            ? `[自动同步] ${new Date().toLocaleString('zh-CN')}`
            : `[手动同步] ${new Date().toLocaleString('zh-CN')}`,
          content, branch: this.branch, ...(sha && { sha })
        })
      });
      if (!res.ok) throw new Error((await res.json()).message || '上传失败');
      localStorage.setItem('gh_last_sync', new Date().toISOString());
      this.updateStatusUI('synced');
      this._updateAutoIndicator(!!this._autoTimer);
      if (!silent) Utils.toast('✅ 同步到 GitHub 成功！', 'success');
      else this._showSyncBadge();
    } catch (e) {
      this.updateStatusUI('error');
      if (!silent) Utils.toast('同步失败：' + e.message, 'error');
      else console.warn('[GitHubSync] 自动同步失败:', e.message);
    }
  },

  // ─────────────────────────────────────────────────────
  // 拉取
  async pull() {
    if (!this.token || !this.repo) { Utils.toast('请先配置 GitHub', 'error'); return; }
    if (!confirm('从 GitHub 拉取将覆盖本地数据，确定继续？')) return;
    this.updateStatusUI('syncing');
    try {
      const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/data.json`,
        { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } });
      if (!res.ok) throw new Error('文件不存在或无权访问');
      const fileData = await res.json();
      const json = decodeURIComponent(escape(atob(fileData.content)));
      DataManager.importJSON(json);
      localStorage.setItem('gh_last_sync', new Date().toISOString());
      this.updateStatusUI('synced');
      Utils.toast('✅ 从 GitHub 拉取成功！', 'success');
      if (typeof renderCurrentPage === 'function') renderCurrentPage();
    } catch (e) {
      this.updateStatusUI('error');
      Utils.toast('拉取失败：' + e.message, 'error');
    }
  },

  // ─────────────────────────────────────────────────────
  // UI 状态
  updateStatusUI(state) {
    const dot  = document.getElementById('syncDot');
    const text = document.getElementById('syncText');
    const last = localStorage.getItem('gh_last_sync');
    const timeAgo = last ? (() => {
      const m = Math.floor((Date.now() - new Date(last)) / 60000);
      if (m < 1) return '刚刚';
      if (m < 60) return `${m}分钟前`;
      if (m < 1440) return `${Math.floor(m/60)}小时前`;
      return `${Math.floor(m/1440)}天前`;
    })() : null;
    if (dot) dot.className = 'sync-dot' + (state==='syncing'?' syncing':state==='error'?' error':'');
    if (text) {
      if (state === 'syncing')     text.textContent = '同步中...';
      else if (state === 'error')  text.textContent = '同步失败';
      else if (timeAgo)            text.textContent = `已同步 ${timeAgo}`;
      else if (!this.token)        text.textContent = '未配置';
      else                         text.textContent = '待同步';
    }
    // 更新自动同步按钮状态
    const autoBtn = document.getElementById('autoSyncBtn');
    if (autoBtn) {
      autoBtn.textContent = this._autoTimer ? '⏸ 暂停自动同步' : '▶ 自动同步';
      autoBtn.style.color = this._autoTimer ? '#10b981' : '';
    }
  },

  _updateAutoIndicator(running, msg = '') {
    const el = document.getElementById('autoSyncStatus');
    if (!el) return;
    const minStr = Math.round(this._autoIntervalMs / 60000);
    if (running) {
      el.innerHTML = `<span style="color:#10b981">● 自动同步 ${msg || `每${minStr}分钟`}</span>`;
    } else {
      el.innerHTML = `<span style="color:var(--gray-400)">○ 自动同步已关闭</span>`;
    }
  },

  // 右上角短暂闪烁"已自动同步"徽章
  _showSyncBadge() {
    const el = document.getElementById('autoSyncIndicator');
    if (!el) return;
    const last = localStorage.getItem('gh_last_sync');
    const t = last ? new Date(last) : new Date();
    el.textContent = `☁️ 已同步至 GitHub ${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
    el.style.opacity = '1';
    setTimeout(() => el.style.opacity = '0.5', 3000);
  },

  // ─────────────────────────────────────────────────────
  // 初始化（页面加载时调用）
  init() {
    this.updateStatusUI();
    if (this.autoOn && this.token && this.repo) {
      this.startAutoSync();
    }
    // 页面关闭前最后同步一次（如果自动同步开启）
    window.addEventListener('beforeunload', () => {
      if (this.autoOn && this.token && this.repo) {
        const snapshot = JSON.stringify({ v: DataManager.versions?.length, m: DataManager.materials?.length });
        if (snapshot !== this._lastDataHash) {
          // 使用 Navigator.sendBeacon 或同步 XHR 确保在卸载时也能发出请求（尽力而为）
          this.push(true);
        }
      }
    });
  }
};