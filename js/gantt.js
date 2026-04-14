// ==================== 甘特图模块（修复版） ====================
const Gantt = {
  _container: null,
  _groupBy: 'version',
  _filterVersion: '',
  _filterAssignee: '',
  _filterType: '',
  _rangeStart: '',
  _rangeEnd: '',
  _minDate: null,
  _maxDate: null,

  // ── 默认时间范围：前7天 ~ 后30天
  _defaultRange() {
    const t = new Date();
    const from = new Date(t.getTime() - 7  * 86400000);
    const to   = new Date(t.getTime() + 30 * 86400000);
    return {
      start: from.toISOString().slice(0, 10),
      end:   to.toISOString().slice(0, 10),
    };
  },

  // ── 主入口
  render(container, opts = {}) {
    this._container = container;
    // 若外部传入时间范围则使用，否则用默认值
    if (opts.rangeStart) this._rangeStart = opts.rangeStart;
    if (opts.rangeEnd)   this._rangeEnd   = opts.rangeEnd;
    if (!this._rangeStart && !this._rangeEnd) {
      const def = this._defaultRange();
      this._rangeStart = def.start;
      this._rangeEnd   = def.end;
    }
    // 外部重置筛选（首页每次 render 时清除残留筛选）
    if (opts.resetFilters) {
      this._filterVersion  = '';
      this._filterAssignee = '';
      this._filterType     = '';
    }

    if (!DataManager.versions.length) {
      container.innerHTML = `<div class="gantt-empty">📭 暂无版本数据
        <br><button class="btn btn-sm" style="margin-top:0.75rem" onclick="Modal.openVersionForm()">➕ 新建第一个版本</button>
      </div>`;
      return;
    }
    this._buildToolbar(container);
    this._renderChart(container);
  },

  // ── 工具栏
  _buildToolbar(container) {
    let tb = container.querySelector('.gantt-toolbar');
    if (!tb) { tb = document.createElement('div'); tb.className = 'gantt-toolbar'; container.prepend(tb); }

    const today = new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' });
    const assignees = [...new Set(DataManager.materials.map(m => m.assignee).filter(Boolean))].sort();
    const typeMap = [['design','美术设计'],['interactive','H5'],['video','视频'],['copy','文案'],['art','原画']];

    // 收集所有版本名（用于版本筛选下拉）
    const vOptions = DataManager.versions.map(v =>
      `<option value="${v.id}" ${this._filterVersion===v.id?'selected':''}>${v.name}</option>`
    ).join('');

    // 当前激活的筛选条件徽标
    const activeFilters = [
      this._filterVersion  && `<span class="filter-tag">版本：${DataManager.getVersion(this._filterVersion)?.name||''}</span>`,
      this._filterType     && `<span class="filter-tag">类型：${typeMap.find(([v])=>v===this._filterType)?.[1]||this._filterType}</span>`,
      this._filterAssignee && `<span class="filter-tag">负责人：${this._filterAssignee}</span>`,
    ].filter(Boolean).join('');

    tb.innerHTML = `
    <div class="gantt-toolbar-row">
      <!-- 今日标识 -->
      <div class="gtb-today-badge">📅 今日 <strong>${today}</strong></div>
      <!-- 分组 -->
      <div class="gtb-group">
        <label class="gtb-label">分组</label>
        <div class="gtb-btns">
          ${[['version','版本'],['assignee','负责人'],['type','类型'],['status','状态']].map(([v,l])=>
            `<button class="gtb-btn ${this._groupBy===v?'active':''}" onclick="Gantt._setGroup('${v}')">${l}</button>`
          ).join('')}
        </div>
      </div>
      <!-- 时间范围 -->
      <div class="gtb-group">
        <label class="gtb-label">时间区间</label>
        <input type="date" class="form-control gtb-input" id="ganttRangeStart" value="${this._rangeStart}"
          onchange="Gantt._setRange('start',this.value)">
        <span class="gtb-sep">—</span>
        <input type="date" class="form-control gtb-input" id="ganttRangeEnd" value="${this._rangeEnd}"
          onchange="Gantt._setRange('end',this.value)">
        <button class="gtb-btn" onclick="Gantt._resetRange()" title="重置为前后2月">↺</button>
      </div>
      <button class="btn btn-success btn-sm" onclick="Modal.openVersionForm()" style="margin-left:auto;white-space:nowrap">➕ 新建版本</button>
    </div>
    <!-- 第二行：多重筛选 -->
    <div class="gantt-toolbar-row" style="margin-top:0.35rem;flex-wrap:wrap">
      <div class="gtb-group">
        <label class="gtb-label">筛选版本</label>
        <select class="form-control gtb-input" onchange="Gantt._setFilter('version',this.value)">
          <option value="">全部版本</option>${vOptions}
        </select>
      </div>
      <div class="gtb-group">
        <label class="gtb-label">素材类型</label>
        <select class="form-control gtb-input" onchange="Gantt._setFilter('type',this.value)">
          <option value="">全部类型</option>
          ${typeMap.map(([v,l])=>`<option value="${v}" ${this._filterType===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="gtb-group">
        <label class="gtb-label">负责人</label>
        <select class="form-control gtb-input" onchange="Gantt._setFilter('assignee',this.value)">
          <option value="">全部</option>
          ${assignees.map(a=>`<option value="${a}" ${this._filterAssignee===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </div>
      ${activeFilters ? `
      <div style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;margin-left:0.5rem">
        ${activeFilters}
        <button class="gtb-btn" onclick="Gantt._clearFilters()" style="color:#ef4444;border-color:#ef4444">✕ 清除筛选</button>
      </div>` : ''}
    </div>
    <!-- 图例 -->
    <div class="gantt-legend">
      <span class="gantt-leg-item"><span class="gantt-leg-dot" style="background:#8b5cf6"></span>前策期</span>
      <span class="gantt-leg-item"><span class="gantt-leg-dot" style="background:#3b82f6"></span>制作期</span>
      <span class="gantt-leg-item"><span class="gantt-leg-dot" style="background:#10b981"></span>执行期</span>
      <span class="gantt-leg-item" style="gap:0.4rem">
        <span class="gantt-leg-ms" style="background:#f59e0b"></span>需求提交
      </span>
      <span class="gantt-leg-item">
        <span class="gantt-leg-ms" style="background:#ef4444"></span>素材提交
      </span>
      <span class="gantt-leg-item">
        <span class="gantt-leg-ms" style="background:#10b981"></span>素材外放
      </span>
      <span class="gantt-leg-item">
        <span style="display:inline-block;width:2px;height:14px;background:#ef4444;border-radius:1px;vertical-align:middle;margin-right:2px"></span>今日
      </span>
    </div>`;
  },

  _setGroup(g)  { this._groupBy = g; this._rerender(); },
  _setRange(w, v) { w==='start'?this._rangeStart=v:this._rangeEnd=v; this._rerender(); },
  _resetRange() { const d=this._defaultRange(); this._rangeStart=d.start; this._rangeEnd=d.end; this._rerender(); },
  _setFilter(f, v) {
    if (f==='version')  this._filterVersion  = v;
    if (f==='assignee') this._filterAssignee = v;
    if (f==='type')     this._filterType     = v;
    this._rerender();
  },
  _clearFilters() { this._filterVersion=''; this._filterAssignee=''; this._filterType=''; this._rerender(); },

  _rerender() {
    if (!this._container) return;
    // 清除所有子元素（包括 .gantt-empty 残留）
    this._container.innerHTML = '';
    this._buildToolbar(this._container);
    this._renderChart(this._container);
  },

  // ── 多重筛选（AND 逻辑）：时间范围 + 版本 + 类型 + 负责人
  _getFilteredVersions() {
    let vs = [...DataManager.versions];

    // 筛选 0：时间范围（版本排期与显示窗口有交叠才显示）
    if (this._rangeStart && this._rangeEnd) {
      const rangeStart = new Date(this._rangeStart + 'T00:00:00');
      const rangeEnd   = new Date(this._rangeEnd   + 'T23:59:59');
      vs = vs.filter(v => {
        // 获取版本的实际排期范围
        let vStart, vEnd;
        if (v.launchDate && v.rank) {
          try {
            const s = calcVersionSchedule(v.launchDate, v.rank);
            vStart = s.startDate;
            vEnd   = s.launchDate;
          } catch(e) {
            vStart = v.startDate ? new Date(v.startDate) : new Date(v.launchDate);
            vEnd   = new Date(v.launchDate);
          }
        } else if (v.launchDate) {
          vEnd   = new Date(v.launchDate + 'T00:00:00');
          vStart = v.startDate ? new Date(v.startDate) : new Date(vEnd.getTime() - 14*86400000);
        } else {
          return false; // 无日期，不显示
        }
        // 交叠判断：版本范围与显示窗口有重叠
        return vStart <= rangeEnd && vEnd >= rangeStart;
      });
    }

    // 筛选 1：指定版本 ID
    if (this._filterVersion) {
      vs = vs.filter(v => v.id === this._filterVersion);
    }

    // 筛选 2：素材类型（版本下有该类型的素材才保留）
    if (this._filterType) {
      const vids = new Set(
        DataManager.materials
          .filter(m => m.type === this._filterType)
          .map(m => m.versionId)
      );
      vs = vs.filter(v => vids.has(v.id));
    }

    // 筛选 3：负责人（版本下有该负责人的素材才保留）
    if (this._filterAssignee) {
      const vids = new Set(
        DataManager.materials
          .filter(m => m.assignee === this._filterAssignee)
          .map(m => m.versionId)
      );
      vs = vs.filter(v => vids.has(v.id));
    }

    return vs;
  },

  // ── 渲染图表
  _renderChart(container) {
    const versions = this._getFilteredVersions();

    if (!versions.length) {
      const d = document.createElement('div');
      d.className = 'gantt-empty';
      d.innerHTML = '筛选后无匹配版本&nbsp; <button class="gtb-btn" onclick="Gantt._clearFilters()">清除筛选</button>';
      container.appendChild(d);
      return;
    }

    const today = new Date();
    // 严格使用用户设定的时间范围
    const minDate = new Date(this._rangeStart + 'T00:00:00');
    const maxDate = new Date(this._rangeEnd   + 'T23:59:59');
    const range   = maxDate - minDate;
    if (range <= 0) { container.appendChild(Object.assign(document.createElement('div'), { className:'gantt-empty', textContent:'时间范围无效，请重新设置' })); return; }

    this._minDate = minDate;
    this._maxDate = maxDate;

    const pct = d => {
      const v = (new Date(d) - minDate) / range * 100;
      return Math.max(0, Math.min(100, v));
    };
    const todayPct = pct(today);

    // 月份表头
    const months = [];
    let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (cur <= maxDate) { months.push(new Date(cur)); cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1); }

    const monthCols = months.map(m => {
      const isThis = m.getFullYear()===today.getFullYear() && m.getMonth()===today.getMonth();
      const yr = m.getMonth()===0 ? `<span style="opacity:0.6;font-size:0.6rem">${m.getFullYear()}<br></span>` : '';
      return `<th class="gantt-month-label${isThis?' today-month':''}">${yr}${m.getMonth()+1}月</th>`;
    }).join('');

    const rows = this._buildRows(versions, pct, todayPct, months.length);

    const wrap = document.createElement('div');
    wrap.className = 'gantt-wrap';
    wrap.innerHTML = `
    <div class="gantt-scroll-wrap">
      <table class="gantt-table">
        <thead>
          <tr class="gantt-head-row">
            <th class="gantt-sidebar" style="font-size:0.72rem;color:var(--gray-500)">
              ${this._groupBy==='version'?'版本':this._groupBy==='assignee'?'负责人':this._groupBy==='type'?'类型':'状态'}
            </th>
            ${monthCols}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
    container.appendChild(wrap);
  },

  // ── 行构建
  _buildRows(versions, pct, todayPct, colSpan) {
    const sorted = [...versions].sort((a,b)=>new Date(a.launchDate||'9999')-new Date(b.launchDate||'9999'));

    if (this._groupBy === 'version') {
      return sorted.map(v => this._makeVersionRow(v, pct, todayPct, colSpan)).join('');
    }

    // 非版本分组：使用已筛选的版本范围内的素材
    const filteredVids = new Set(versions.map(v => v.id));
    let mats = DataManager.materials.filter(m => filteredVids.has(m.versionId));
    if (this._filterType)     mats = mats.filter(m => m.type     === this._filterType);
    if (this._filterAssignee) mats = mats.filter(m => m.assignee === this._filterAssignee);

    const typeMap    = { design:'美术设计', interactive:'H5', video:'视频', copy:'文案', art:'原画' };
    const statusMap  = { todo:'待开始', 'in-progress':'进行中', review:'审核中', done:'已完成' };
    const statusClr  = { todo:'#6b7280', 'in-progress':'#f59e0b', review:'#3b82f6', done:'#10b981' };
    const assignClr  = '#764ba2';
    const typeClr    = '#059669';

    const groups = {};
    mats.forEach(m => {
      const key = this._groupBy==='assignee' ? (m.assignee||'未分配') :
                  this._groupBy==='type'     ? m.type :
                  m.status;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });

    return Object.entries(groups).map(([key, ms]) => {
      const done  = ms.filter(m=>m.status==='done').length;
      const prog  = ms.length ? Math.round(done/ms.length*100) : 0;
      // 用版本排期计算 bar 范围（取最早 startDate 和最晚 launchDate）
      const allSched = ms.map(m => {
        const v = DataManager.getVersion(m.versionId);
        if (!v?.launchDate) return null;
        try {
          if (v.rank) { const s = calcVersionSchedule(v.launchDate, v.rank); return { s: s.startDate, e: s.launchDate }; }
          return { s: new Date(v.launchDate+'T00:00:00'), e: new Date(v.launchDate+'T00:00:00') };
        } catch(_) { return null; }
      }).filter(Boolean);

      let sDate, eDate;
      if (allSched.length) {
        sDate = new Date(Math.min(...allSched.map(x => x.s)));
        eDate = new Date(Math.max(...allSched.map(x => x.e)));
      } else {
        // 回退：以显示窗口的 1/4 到 3/4 作为占位 bar
        sDate = new Date(this._minDate.getTime() + (this._maxDate - this._minDate) * 0.1);
        eDate = new Date(this._minDate.getTime() + (this._maxDate - this._minDate) * 0.9);
      }
      const barL = pct(sDate);
      const barW = Math.max(pct(eDate) - barL, 2);
      const label = this._groupBy==='type'   ? typeMap[key]||key :
                    this._groupBy==='status' ? statusMap[key]||key : key;
      const color = this._groupBy==='status'   ? statusClr[key]||'#6b7280' :
                    this._groupBy==='assignee' ? assignClr : typeClr;
      return this._makeSimpleRow({ label, subLabel:`${ms.length}个素材 · ${done}完成`, progress:prog, barL, barW, todayPct, colSpan, color });
    }).join('');
  },

  // ── 版本行（三阶段 + 三里程碑）
  _makeVersionRow(v, pct, todayPct, colSpan) {
    const mats = DataManager.getMaterialsByVersion(v.id);
    // 进一步筛选素材（类型/负责人）
    const filteredMats = mats.filter(m =>
      (!this._filterType || m.type === this._filterType) &&
      (!this._filterAssignee || m.assignee === this._filterAssignee)
    );

    let phases = [], milestones = [], barL = 0, barW = 0;
    let schedStart = null, schedEnd = null;

    if (v.launchDate && v.rank) {
      try {
        const s = calcVersionSchedule(v.launchDate, v.rank);
        phases = s.phases; milestones = s.milestones;
        schedStart = s.startDate; schedEnd = s.launchDate;
        barL = pct(schedStart);
        barW = Math.max(pct(schedEnd) - barL, 0.5);
      } catch(e) {}
    } else if (v.launchDate) {
      schedEnd   = new Date(v.launchDate + 'T00:00:00');
      schedStart = v.startDate ? new Date(v.startDate) : new Date(schedEnd.getTime() - 14*86400000);
      barL = pct(schedStart);
      barW = Math.max(pct(schedEnd) - barL, 0.5);
    }

    const rankBadge = v.rank ? `<span class="badge rank-${v.rank.toLowerCase()}" style="font-size:0.6rem">${v.rank}</span> ` : '';

    // 阶段色块
    const phaseBars = phases.map((p, i) => {
      const pl = pct(p.start), pw = Math.max(pct(p.end)-pl, 0);
      const radius = i===0?'6px 0 0 6px': i===phases.length-1?'0 6px 6px 0':'0';
      return `<div class="gantt-phase" style="left:${pl}%;width:${pw}%;background:${p.color};border-radius:${radius}" title="${p.name}: ${this._fmtD(p.start)}~${this._fmtD(p.end)}">
        <span class="gantt-phase-label">${p.name}</span>
      </div>`;
    }).join('');

    // 进度覆盖层
    const progressLayer = phases.length && v.progress > 0
      ? `<div class="gantt-progress-overlay" style="left:${barL}%;width:${barW*(v.progress/100)}%;background:rgba(255,255,255,0.22)"></div>`
      : '';

    // 里程碑
    const mstMarkers = milestones.map(m => {
      const ml = pct(m.date);
      // 只显示在时间范围内的里程碑
      if (ml < 0 || ml > 100) return '';
      return `<div class="gantt-milestone-wrap" style="left:${ml}%">
        <div class="gantt-ms-line" style="background:${m.color}"></div>
        <div class="gantt-ms-diamond" style="border-color:${m.color}" title="${m.name}: ${this._fmtD(m.date)}"></div>
        <div class="gantt-ms-label" style="color:${m.color}">${m.name}</div>
      </div>`;
    }).join('');

    // 素材完成统计（仅显示筛选后的素材）
    const displayMats = filteredMats.length ? filteredMats : mats;
    const doneCnt = displayMats.filter(m=>m.status==='done').length;
    const subLabel = `${doneCnt}/${displayMats.length} · ${v.progress||0}% · ${v.launchDate||'无日期'}`;

    return `
    <tr class="gantt-row" data-id="${v.id}">
      <td class="gantt-sidebar gantt-label" onclick="Modal.openVersionDetail('${v.id}')" style="cursor:pointer">
        <div class="gantt-label-name" title="${v.name}">${rankBadge}${v.name}</div>
        <div class="gantt-label-meta">${subLabel}</div>
      </td>
      <td class="gantt-cell" colspan="${colSpan}" style="position:relative">
        <div class="gantt-row-inner">
          ${todayPct>0&&todayPct<100?`<div class="gantt-today-line" style="left:${todayPct}%"></div>`:''}
          ${phases.length ? phaseBars : barW>0 ? `<div class="gantt-phase" style="left:${barL}%;width:${barW}%;background:#667eea;border-radius:6px"><span class="gantt-phase-label">${v.name}</span></div>` : `<div class="gantt-no-date">超出时间范围或无日期</div>`}
          ${progressLayer}
          ${mstMarkers}
          ${v.launchDate?`<div class="gantt-bar-handle" onmousedown="Gantt.startDragHandle(event,'${v.id}')" title="拖拽调整上线日"></div>`:''}
        </div>
        <div class="gantt-row-actions">
          <button class="gantt-action-btn" onclick="Gantt.openProgressEditor('${v.id}')" title="编辑进度">📊</button>
          <button class="gantt-action-btn" onclick="Modal.openVersionForm('${v.id}')" title="编辑">✏️</button>
          <button class="gantt-action-btn danger" onclick="Gantt._deleteVersion('${v.id}')" title="删除">🗑️</button>
        </div>
      </td>
    </tr>`;
  },

  _makeSimpleRow({ label, subLabel, progress, barL, barW, todayPct, colSpan, color }) {
    return `
    <tr class="gantt-row gantt-group-row">
      <td class="gantt-sidebar gantt-label">
        <div class="gantt-label-name">${label}</div>
        <div class="gantt-label-meta">${subLabel}</div>
      </td>
      <td class="gantt-cell" colspan="${colSpan}">
        <div class="gantt-row-inner">
          ${todayPct>0&&todayPct<100?`<div class="gantt-today-line" style="left:${todayPct}%"></div>`:''}
          <div class="gantt-phase" style="left:${barL}%;width:${Math.max(barW,0.5)}%;background:${color};border-radius:6px;opacity:0.88">
            <span class="gantt-phase-label">${label} ${progress}%</span>
          </div>
          <div class="gantt-progress-overlay" style="left:${barL}%;width:${Math.max(barW,0.5)*progress/100}%;background:rgba(255,255,255,0.22)"></div>
        </div>
      </td>
    </tr>`;
  },

  _fmtD(d) { return d ? new Date(d).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}) : ''; },

  _deleteVersion(id) {
    const v = DataManager.getVersion(id);
    if (!v || !confirm(`确定删除版本「${v.name}」及其所有素材？`)) return;
    DataManager.deleteVersion(id);
    Utils.toast('版本已删除', 'success');
    if (typeof renderCurrentPage==='function') renderCurrentPage();
  },

  // ── 进度编辑弹窗
  openProgressEditor(versionId) {
    const v = DataManager.getVersion(versionId);
    if (!v) return;
    const mats = DataManager.getMaterialsByVersion(versionId);
    let schedHTML = '';
    if (v.launchDate && v.rank) {
      try {
        const s = calcVersionSchedule(v.launchDate, v.rank);
        schedHTML = `<div class="schedule-timeline">
          <div class="sched-title">⏱️ ${v.rank}级排期（${RANK_SCHEDULE[v.rank]?.total}天，从上线日倒推）</div>
          <div class="sched-phases">${s.phases.map(p=>`
            <div class="sched-phase" style="background:${p.color}22;border-left:3px solid ${p.color}">
              <span class="sched-phase-name" style="color:${p.color}">${p.name}</span>
              <span class="sched-phase-date">${this._fmtD(p.start)} — ${this._fmtD(p.end)}</span>
              <span class="sched-phase-days">${p.days}天</span>
            </div>`).join('')}</div>
          <div class="sched-milestones">${s.milestones.map(m=>`
            <div class="sched-ms-item">
              <div class="sched-ms-dot" style="background:${m.color}"></div>
              <span class="sched-ms-name">${m.icon} ${m.name}</span>
              <span class="sched-ms-date" style="color:${m.color};font-weight:700">${this._fmtD(m.date)}</span>
            </div>`).join('')}</div>
        </div>`;
      } catch(e) {}
    }

    const html = `
    <div class="modal-overlay active" id="modalProgressEdit">
      <div class="modal-box" style="max-width:560px">
        <div class="modal-head">
          <h2>📊 排期与进度 · ${v.name}</h2>
          <button class="modal-close" onclick="Modal.close('modalProgressEdit')">×</button>
        </div>
        <div class="modal-body">
          ${schedHTML}
          <div class="form-section" style="margin-top:${schedHTML?'1rem':'0'}">
            <div class="form-section-title">📅 时间节点</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">开始日期</label>
                <input type="date" class="form-control" id="peStart" value="${v.startDate||v.createdAt?.slice(0,10)||''}">
              </div>
              <div class="form-group">
                <label class="form-label">上线日期 <span style="color:var(--danger)">*</span></label>
                <input type="date" class="form-control" id="peEnd" value="${v.launchDate||''}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">版本等级</label>
                <select class="form-control" id="peRank">
                  ${['S','A','B'].map(r=>`<option value="${r}" ${v.rank===r?'selected':''}>${r}级（${RANK_SCHEDULE[r]?.total}天）</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">状态</label>
                <select class="form-control" id="peStatus">
                  ${[['planning','计划中'],['in-progress','进行中'],['review','审核中'],['done','已完成']]
                    .map(([val,lbl])=>`<option value="${val}" ${v.status===val?'selected':''}>${lbl}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section-title" style="display:flex;justify-content:space-between">
              <span>📈 完成进度</span>
              ${mats.length?`<button class="btn btn-ghost btn-sm" onclick="Gantt._autoCalcProgress('${versionId}')">🔄 自动计算</button>`:''}
            </div>
            <div class="progress-editor">
              <input type="range" class="progress-slider" id="peSlider" min="0" max="100" value="${v.progress||0}"
                oninput="document.getElementById('peNum').value=this.value;document.getElementById('peBarFill').style.width=this.value+'%'">
              <input type="number" class="form-control progress-num-input" id="peNum" min="0" max="100" value="${v.progress||0}"
                oninput="document.getElementById('peSlider').value=this.value;document.getElementById('peBarFill').style.width=this.value+'%'">
              <span style="color:var(--gray-500)">%</span>
            </div>
            <div class="progress-bar" style="height:10px;margin-top:0.5rem">
              <div class="progress-fill" id="peBarFill" style="width:${v.progress||0}%"></div>
            </div>
            ${mats.length?`<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.78rem;margin-top:0.5rem;color:var(--gray-500)">
              <span>总 <b>${mats.length}</b></span>
              <span style="color:var(--success)">✅ <b>${mats.filter(m=>m.status==='done').length}</b></span>
              <span style="color:var(--warning)">▶ <b>${mats.filter(m=>m.status==='in-progress').length}</b></span>
              <span style="color:var(--info)">👁 <b>${mats.filter(m=>m.status==='review').length}</b></span>
              <span>⬜ <b>${mats.filter(m=>m.status==='todo').length}</b></span>
            </div>`:''}
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="Modal.close('modalProgressEdit');Modal.openVersionForm('${versionId}')">✏️ 编辑版本</button>
            <button class="btn btn-ghost btn-sm" onclick="Modal.close('modalProgressEdit');Modal.openMaterialForm(null,'${versionId}')">➕ 添加素材</button>
            <button class="btn btn-ghost btn-sm" onclick="Modal.close('modalProgressEdit');Modal.openVersionDetail('${versionId}')">📋 查看详情</button>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalProgressEdit')">取消</button>
          <button class="btn" onclick="Gantt._saveProgress('${versionId}')">💾 保存</button>
        </div>
      </div>
    </div>`;
    Modal.create('modalProgressEdit', html);
  },

  _previewSched(rank, launchDate) {
    if (!rank || !launchDate) return;
    try {
      const s = calcVersionSchedule(launchDate, rank);
      // 简单 toast 提示
      const submit = s.milestones.find(m=>m.key==='submit');
      const req = s.milestones.find(m=>m.key==='req');
      if (req && submit) Utils.toast(`📋 需求提交 ${Gantt._fmtD(req.date)} · 📦 素材提交 ${Gantt._fmtD(submit.date)}`, 'info', 4000);
    } catch(e) {}
  },

  _autoCalcProgress(versionId) {
    const mats = DataManager.getMaterialsByVersion(versionId);
    if (!mats.length) return;
    const p = Math.round(mats.filter(m=>m.status==='done').length / mats.length * 100);
    document.getElementById('peSlider').value = p;
    document.getElementById('peNum').value = p;
    document.getElementById('peBarFill').style.width = p + '%';
    Utils.toast('已自动计算完成率 ' + p + '%', 'success');
  },

  _saveProgress(versionId) {
    DataManager.updateVersion(versionId, {
      progress:    Math.min(100, Math.max(0, parseInt(document.getElementById('peNum').value)||0)),
      startDate:   document.getElementById('peStart').value,
      launchDate:  document.getElementById('peEnd').value,
      rank:        document.getElementById('peRank').value,
      status:      document.getElementById('peStatus').value,
    });
    Modal.close('modalProgressEdit');
    Utils.toast('排期与进度已保存', 'success');
    if (typeof renderCurrentPage==='function') renderCurrentPage();
  },

  // ── 拖拽调整上线日期
  startDragHandle(e, versionId) {
    e.stopPropagation(); e.preventDefault();
    const v = DataManager.getVersion(versionId);
    if (!v) return;
    const cell = e.target.closest('tr')?.querySelector('.gantt-cell');
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    document.body.style.cursor = 'ew-resize';
    let pending = null;
    const onMove = ev => {
      const ratio = Math.max(0, Math.min(1, (ev.clientX-rect.left)/rect.width));
      pending = new Date(this._minDate.getTime() + ratio*(this._maxDate-this._minDate));
    };
    const onUp = () => {
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (pending) {
        const iso = pending.toISOString().slice(0,10);
        DataManager.updateVersion(versionId, { launchDate: iso });
        Utils.toast('上线日期已调整为 ' + iso, 'success');
        if (typeof renderCurrentPage==='function') renderCurrentPage();
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  },

  // ── 素材排期甘特图（版本详情卡片内）重写版 - 支持无素材/筛选/编辑
  renderMaterialGantt(container, versionId, filterType = '') {
    const v = DataManager.getVersion(versionId);
    if (!v) { container.innerHTML = '<div class="gantt-empty" style="padding:1rem">找不到版本数据</div>'; return; }

    // 全部素材
    const allMats = DataManager.getMaterialsByVersion(versionId)
      .sort((a, b) => {
        const p = { high:0, medium:1, low:2 };
        return (p[a.priority]||1) - (p[b.priority]||1) || (a.type||'').localeCompare(b.type||'');
      });

    // 筛选
    const mats = filterType ? allMats.filter(m => m.type === filterType) : allMats;

    // 所有已有类型 → 筛选按钮
    const allTypes   = [...new Set(allMats.map(m => m.type || 'design'))];
    const typeMap    = { design:'美术设计', interactive:'H5', video:'视频', copy:'文案', art:'原画' };
    const typeColors = { design:'#8b5cf6', art:'#ec4899', video:'#ef4444', copy:'#6b7280', interactive:'#3b82f6' };
    const filterBar  = `
      <div class="mg-filterbar">
        <button class="mg-flt-btn${filterType===''?' active':''}" onclick="Gantt.renderMaterialGantt(this.closest('.mg-wrap-outer').querySelector('.mg-inner'),'${versionId}','')">全部</button>
        ${allTypes.map(t => `<button class="mg-flt-btn${filterType===t?' active':''}" style="--fc:${typeColors[t]||'#6b7280'}" onclick="Gantt.renderMaterialGantt(this.closest('.mg-wrap-outer').querySelector('.mg-inner'),'${versionId}','${t}')">${typeMap[t]||t}</button>`).join('')}
        <button class="mg-flt-btn" style="margin-left:auto;background:rgba(102,126,234,0.1);color:var(--primary)" onclick="Modal.openMaterialForm(null,'${versionId}');setTimeout(()=>Gantt.renderMaterialGantt(this.closest('.mg-wrap-outer').querySelector('.mg-inner'),'${versionId}','${filterType}'),800)">➕ 添加素材</button>
      </div>`;

    // 版本排期计算
    let sched = null;
    if (v.launchDate && v.rank) {
      try { sched = calcVersionSchedule(v.launchDate, v.rank); } catch(e) {}
    }
    const today   = new Date();
    const launchD = v.launchDate ? new Date(v.launchDate + 'T00:00:00') : new Date(today.getTime() + 14*86400000);
    const startD  = sched ? sched.startDate : new Date(launchD.getTime() - 14*86400000);
    const minDate = new Date(startD.getTime() - 2*86400000);
    const maxDate = new Date(launchD.getTime() + 2*86400000);
    const range   = maxDate - minDate || 1;
    const pct     = d => Math.max(0, Math.min(100, (new Date(d) - minDate) / range * 100));
    const todayPct = pct(today);

    // 刻度
    const totalDays = Math.round(range / 86400000);
    let ticks = '';
    const step = totalDays <= 14 ? 1 : totalDays <= 35 ? 3 : 7;
    let td = new Date(minDate);
    while (td <= maxDate) {
      const tp = pct(td);
      const isWE = td.getDay() === 0 || td.getDay() === 6;
      ticks += `<div class="mg-tick${isWE?' mg-weekend':''}" style="left:${tp}%"><div class="mg-tick-line"></div><div class="mg-tick-label">${td.getMonth()+1}/${td.getDate()}</div></div>`;
      td = new Date(td.getTime() + step*86400000);
    }

    // 阶段背景 & 里程碑线
    let phaseBg = '', mstLines = '';
    if (sched) {
      phaseBg  = sched.phases.map(p => {
        const pl = pct(p.start), pw = Math.max(pct(p.end)-pl, 0);
        return `<div class="mg-phase-bg" style="left:${pl}%;width:${pw}%;background:${p.color}14;border-right:1px dashed ${p.color}44" title="${p.name}"><span class="mg-phase-label-bg" style="color:${p.color}99">${p.name}</span></div>`;
      }).join('');
      mstLines = sched.milestones.map(m => {
        const ml = pct(m.date);
        if (ml < 0 || ml > 100) return '';
        return `<div class="mg-ms-line" style="left:${ml}%;border-left-color:${m.color}"><div class="mg-ms-label-top" style="color:${m.color}">${m.icon}${m.name}</div></div>`;
      }).join('');
    }
    const todayLine = todayPct > 0 && todayPct < 100
      ? `<div class="mg-today-line" style="left:${todayPct}%"><div style="position:absolute;top:2px;left:3px;font-size:0.58rem;color:#ef4444;white-space:nowrap">今日</div></div>` : '';

    // 排期骨架行（版本阶段，不依赖素材）
    const statColor = { todo:'#9ca3af', 'in-progress':'#f59e0b', review:'#3b82f6', done:'#10b981' };

    // 计算制作期 barStart
    let prodStart = startD;
    if (sched) {
      const pp = sched.phases.find(p => p.key === 'make' || p.name === '制作期');
      if (pp) prodStart = pp.start;
    }

    // 若无素材，显示排期骨架提示
    let matRowsHtml = '';
    if (!mats.length) {
      matRowsHtml = `
        <div class="mg-empty-sched">
          <div class="mg-row" style="opacity:0.5;pointer-events:none">
            <div class="mg-row-label"><span class="mg-status-dot" style="background:#d1d5db"></span><span class="mg-row-name" style="color:var(--gray-400)">暂无${filterType?typeMap[filterType]+'类':''}素材</span></div>
            <div class="mg-bar-area">
              ${phaseBg}${mstLines}${todayLine}
              <div class="mg-bar" style="left:${pct(prodStart)}%;width:${Math.max(pct(launchD)-pct(prodStart),2)}%;background:#e5e7eb;border:1.5px dashed #d1d5db"></div>
            </div>
          </div>
          <div style="text-align:center;padding:0.75rem;font-size:0.78rem;color:var(--gray-400)">
            ${filterType ? `当前筛选「${typeMap[filterType]||filterType}」无素材，<button class="btn btn-ghost btn-sm" style="font-size:0.72rem" onclick="Gantt.renderMaterialGantt(this.closest('.mg-wrap-outer').querySelector('.mg-inner'),'${versionId}','')">查看全部</button>` : '点击右上角「➕ 添加素材」开始排期'}
          </div>
        </div>`;
    } else {
      // 按类型分组
      const typeGroups = {};
      mats.forEach(m => {
        const t = m.type || 'design';
        if (!typeGroups[t]) typeGroups[t] = [];
        typeGroups[t].push(m);
      });

      matRowsHtml = Object.entries(typeGroups).map(([type, tMats]) => {
        const groupHdr = `<div class="mg-group-header" style="display:flex;align-items:center;gap:0.5rem">
          <span style="width:8px;height:8px;border-radius:50%;background:${typeColors[type]||'#6b7280'};flex-shrink:0"></span>
          <span style="font-size:0.7rem;font-weight:700;color:var(--gray-600)">${typeMap[type]||type} <span style="color:var(--gray-400);font-weight:400">(${tMats.length})</span></span>
        </div>`;

        const rows = tMats.map(m => {
          const dueD    = m.dueDate ? new Date(m.dueDate + 'T00:00:00') : launchD;
          const bl      = Math.min(pct(prodStart), pct(dueD) - 2);
          const bw      = Math.max(pct(dueD) - bl, 2);
          const dotPos  = pct(dueD);
          const sc      = statColor[m.status] || '#9ca3af';
          const overdue = m.dueDate && m.status !== 'done' && dueD < today;
          return `
          <div class="mg-row">
            <div class="mg-row-label" title="${m.name}" onclick="Modal.openMaterialDetail('${m.id}')" style="cursor:pointer">
              <span class="mg-status-dot" style="background:${sc}"></span>
              <span class="mg-row-name${overdue?' mg-overdue':''}">${m.name}</span>
              ${m.assignee ? `<span class="mg-assignee">${m.assignee}</span>` : ''}
            </div>
            <div class="mg-row-actions">
              <input type="date" class="mg-due-input" value="${m.dueDate||''}" title="截止日" onchange="Gantt._mgUpdateDue('${m.id}','${versionId}',this.value,'${filterType}',this)">
              <button class="mg-act-btn" title="编辑素材" onclick="Modal.openMaterialDetail('${m.id}')">✏️</button>
            </div>
            <div class="mg-bar-area">
              ${phaseBg}${mstLines}${todayLine}
              <div class="mg-bar" style="left:${bl}%;width:${bw}%;background:${sc}33;border:1.5px solid ${sc}88" title="${m.name}"></div>
              <div class="mg-dot" style="left:${dotPos}%;background:${sc};border-color:${overdue?'#ef4444':'white'}" title="截止：${m.dueDate||'未设'}"></div>
            </div>
          </div>`;
        }).join('');

        return groupHdr + rows;
      }).join('');
    }

    container.innerHTML = `
    ${filterBar}
    <div class="mat-gantt-wrap">
      <div class="mg-header">
        <div class="mg-sidebar-ph" style="min-width:260px;width:260px"></div>
        <div class="mg-timeline-header" style="position:relative;height:28px;flex:1">
          ${phaseBg}${mstLines}${todayLine}${ticks}
        </div>
      </div>
      <div class="mg-rows">${matRowsHtml}</div>
      ${sched ? `
      <div class="mg-legend">
        ${sched.phases.map(p=>`<span class="mg-legend-item"><span style="width:10px;height:10px;border-radius:2px;background:${p.color}44;border:1px solid ${p.color}88;display:inline-block"></span>${p.name}</span>`).join('')}
        <span class="mg-legend-item"><span style="width:2px;height:12px;background:#ef4444;display:inline-block;border-radius:1px"></span>今日</span>
        ${sched.milestones.map(m=>`<span class="mg-legend-item">${m.icon}${m.name}</span>`).join('')}
      </div>` : ''}
    </div>`;
  },

  // 更新素材截止日并重新渲染
  _mgUpdateDue(matId, versionId, newDate, filterType, inputEl) {
    DataManager.updateMaterial(matId, { dueDate: newDate });
    Utils.toast('截止日已更新', 'success');
    // 重新渲染
    const inner = inputEl.closest('.mg-inner') || inputEl.closest('[id="vd_matgantt_inner"]');
    if (inner) Gantt.renderMaterialGantt(inner, versionId, filterType);
  }
};
