
// ==================== 工具函数 ====================
const Utils = {
  // 生成唯一 ID
  uuid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },
  // 格式化文件大小
  fileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  },
  // Toast 通知
  toast(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div');
      el.id = 'toast-container';
      document.body.appendChild(el);
      return el;
    })();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  },
  // 标签映射
  statusLabel(s) {
    return { todo:'待开始', 'in-progress':'进行中', review:'审核中', done:'已完成', planning:'计划中', 'not-started':'未开始' }[s] || s;
  },
  statusClass(s) {
    return { todo:'status-todo', 'in-progress':'status-in-progress', review:'status-review', done:'status-done', planning:'status-planning', 'not-started':'status-todo' }[s] || '';
  },
  typeLabel(t) {
    return { design:'美术设计', art:'原画', video:'视频', copy:'文案', interactive:'交互设计' }[t] || t;
  },
  typeIcon(t) {
    return { design:'🎨', art:'🖼️', video:'🎬', copy:'📝', interactive:'💻' }[t] || '📄';
  },
  priorityLabel(p) {
    return { high:'高', medium:'中', low:'低' }[p] || p;
  },
  priorityClass(p) {
    return { high:'priority-high', medium:'priority-medium', low:'priority-low' }[p] || '';
  },
  fileIcon(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    const m = { pdf:'📕', doc:'📘', docx:'📘', xls:'📗', xlsx:'📗', ppt:'📙', pptx:'📙',
                jpg:'🖼️', jpeg:'🖼️', png:'🖼️', gif:'🖼️', webp:'🖼️',
                mp4:'🎬', avi:'🎬', mov:'🎬', zip:'📦', rar:'📦', psd:'🎨', ai:'🎨' };
    return m[ext] || '📄';
  },
  // 时间格式化
  formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('zh-CN');
  },
  formatDateTime(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('zh-CN');
  },
  // 高亮当前导航项
  highlightNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === path);
    });
  }
};
