
// ==================== GitHub 同步 ====================
const GitHubSync = {
  get token() { return localStorage.getItem('gh_token') || ''; },
  get repo()  { return localStorage.getItem('gh_repo')  || ''; },
  branch: 'main',

  configure() {
    const token = prompt('请输入 GitHub Personal Access Token:', this.token);
    const repo  = prompt('请输入仓库地址 (格式: username/repo):', this.repo);
    if (token && repo) {
      localStorage.setItem('gh_token', token);
      localStorage.setItem('gh_repo',  repo);
      this.updateStatusUI();
      Utils.toast('GitHub 配置已保存', 'success');
    }
  },

  async push() {
    if (!this.token || !this.repo) {
      if (confirm('GitHub 未配置，是否立即配置？')) this.configure();
      return;
    }
    this.updateStatusUI('syncing');
    try {
      const data = { versions: DataManager.versions, materials: DataManager.materials, savedAt: new Date().toISOString() };
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
      let sha = null;
      try {
        const r = await fetch(`https://api.github.com/repos/${this.repo}/contents/data.json`,
          { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } });
        if (r.ok) sha = (await r.json()).sha;
      } catch (_) { /* 首次创建 */ }

      const res = await fetch(`https://api.github.com/repos/${this.repo}/contents/data.json`, {
        method: 'PUT',
        headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `同步数据 ${new Date().toLocaleString('zh-CN')}`, content, branch: this.branch, ...(sha && { sha }) })
      });
      if (!res.ok) throw new Error((await res.json()).message || '上传失败');
      localStorage.setItem('gh_last_sync', new Date().toISOString());
      this.updateStatusUI('synced');
      Utils.toast('同步到 GitHub 成功！', 'success');
    } catch (e) {
      this.updateStatusUI('error');
      Utils.toast('同步失败：' + e.message, 'error');
    }
  },

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
      Utils.toast('从 GitHub 拉取成功！', 'success');
      if (typeof renderCurrentPage === 'function') renderCurrentPage();
    } catch (e) {
      this.updateStatusUI('error');
      Utils.toast('拉取失败：' + e.message, 'error');
    }
  },

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

    if (dot) {
      dot.className = 'sync-dot' + (state === 'syncing' ? ' syncing' : state === 'error' ? ' error' : '');
    }
    if (text) {
      if (state === 'syncing') text.textContent = '同步中...';
      else if (state === 'error') text.textContent = '同步失败';
      else if (timeAgo) text.textContent = `已同步 · ${timeAgo}`;
      else if (!this.token) text.textContent = '未配置 GitHub';
      else text.textContent = '未同步';
    }
  }
};
