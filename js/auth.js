// ==================== 登录认证守卫 ====================
const SESSION_KEY   = 'g17_auth';
const SESSION_EXPIRE = 8 * 60 * 60 * 1000; // 8 小时

const Auth = {
  // 检查登录状态，未登录跳转到 login.html
  guard() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) { this._redirect(); return false; }
    try {
      const s = JSON.parse(raw);
      if (!s || s.exp < Date.now()) { this._redirect(); return false; }
      return true;
    } catch(_) { this._redirect(); return false; }
  },

  // 退出登录
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace('login.html');
  },

  // 获取当前登录用户 ID
  currentUser() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null');
      return s?.id || '';
    } catch(_) { return ''; }
  },

  // 刷新 session 有效期（操作时自动续期）
  refresh() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      s.exp = Date.now() + SESSION_EXPIRE;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch(_) {}
  },

  _redirect() {
    if (!location.pathname.endsWith('login.html')) {
      location.replace('login.html');
    }
  }
};
