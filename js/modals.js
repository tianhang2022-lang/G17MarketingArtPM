// ==================== 弹窗管理器 ====================
const Modal = {
  open(id) { const el = document.getElementById(id); if (el) el.classList.add('active'); },
  close(id) { const el = document.getElementById(id); if (el) el.classList.remove('active'); },
  closeAll() { document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active')); },
  create(id, html) {
    const old = document.getElementById(id);
    if (old) old.remove();
    document.body.insertAdjacentHTML('beforeend', html);
    const el = document.getElementById(id);
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('active'); });
    return el;
  },
  initTabs(container, versionId) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pane = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = container.querySelector(`#${pane}`);
        if (target) target.classList.add('active');
        // 渲染素材排期甘特图（每次切换都重新渲染确保数据最新）
        if (pane === 'vd_matgantt' && versionId) {
          const inner = container.querySelector('#vd_matgantt_inner');
          if (inner) Gantt.renderMaterialGantt(inner, versionId, '');
        }
      });
    });
  },

  // ==================== 版本表单（带星级预设） ====================
  openVersionForm(versionId = null) {
    const v = versionId ? DataManager.getVersion(versionId) : null;
    const title = v ? '编辑版本' : '新建版本';
    const html = `
    <div class="modal-overlay active" id="modalVersionForm">
      <div class="modal-box wide">
        <div class="modal-head">
          <h2>${v ? '✏️' : '➕'} ${title}</h2>
          <button class="modal-close" onclick="Modal.close('modalVersionForm')">×</button>
        </div>
        <div class="modal-body">
          <!-- 版本表单标签页 -->
          <div class="version-form-tabs">
            <button class="vf-tab-btn active" onclick="Modal._vfSwitchTab(this,'vfBasic')">📝 基本信息</button>
            ${!v ? `<button class="vf-tab-btn" onclick="Modal._vfSwitchTab(this,'vfPreset')">⭐ 素材需求预设</button>` : ''}
          </div>

          <!-- 基本信息 -->
          <div class="vf-pane active" id="vfBasic">
            <div class="form-section">
              <div class="form-section-title">核心信息</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">版本名称 *</label>
                  <input class="form-control" id="vf_name" value="${v ? v.name : ''}" placeholder="如 v3.5 春节特别版">
                </div>
                <div class="form-group">
                  <label class="form-label">版本定级 *</label>
                  <select class="form-control" id="vf_rank">
                    ${['S','A','B'].map(r => `<option value="${r}" ${v && v.rank===r?'selected':''}>${r}级</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">所属分类</label>
                  <input class="form-control" id="vf_category" value="${v ? v.category||'' : ''}" placeholder="如 节日活动、日常运营">
                </div>
                <div class="form-group">
                  <label class="form-label">优先级</label>
                  <select class="form-control" id="vf_priority">
                    ${['最高','高','中','低'].map(p => `<option value="${p}" ${v && v.priority===p?'selected':''}>${p}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            <div class="form-section">
              <div class="form-section-title">时间安排</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">开始日期</label>
                  <input type="date" class="form-control" id="vf_startDate" value="${v ? v.startDate||'' : ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">上线日期</label>
                  <input type="date" class="form-control" id="vf_launchDate" value="${v ? v.launchDate||'' : ''}">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">备用上线日期</label>
                  <input type="date" class="form-control" id="vf_launchDate2" value="${v ? v.launchDate2||'' : ''}">
                </div>
                <div class="form-group">
                  <label class="form-label">当前状态</label>
                  <select class="form-control" id="vf_status">
                    ${[['planning','计划中'],['in-progress','进行中'],['review','审核中'],['done','已完成']]
                      .map(([val,lbl]) => `<option value="${val}" ${v && v.status===val?'selected':''}>${lbl}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            <div class="form-section">
              <div class="form-section-title">责任人</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">责任营销</label>
                  <input class="form-control" id="vf_marketingOwner" value="${v ? v.marketingOwner||'' : ''}" placeholder="姓名">
                </div>
                <div class="form-group">
                  <label class="form-label">责任策划</label>
                  <input class="form-control" id="vf_planningOwner" value="${v ? v.planningOwner||'' : ''}" placeholder="姓名">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">版本说明</label>
              <textarea class="form-control" id="vf_description" rows="3" placeholder="简要描述版本内容、特色...">${v ? v.description||'' : ''}</textarea>
            </div>
          </div>

          ${!v ? `
          <!-- 素材需求预设（仅新建时显示） -->
          <div class="vf-pane" id="vfPreset">
            <div style="margin-bottom:1rem;color:var(--gray-600);font-size:0.875rem">
              选择星级后会自动填充该等级的标准素材需求清单，你可以修改每条需求的名称、类型和 Brief。
            </div>

            <!-- 星级选择器 -->
            <div class="star-selector">
              <button class="star-btn" onclick="Modal._loadPreset(5,this)">
                <div class="star-btn-icon">⭐⭐⭐⭐⭐</div>
                <div class="star-btn-label">5星版本</div>
                <div class="star-btn-desc">12项标准素材</div>
              </button>
              <button class="star-btn" onclick="Modal._loadPreset(4,this)">
                <div class="star-btn-icon">⭐⭐⭐⭐</div>
                <div class="star-btn-label">4星版本</div>
                <div class="star-btn-desc">7项标准素材</div>
              </button>
              <button class="star-btn" onclick="Modal._loadPreset(3,this)">
                <div class="star-btn-icon">⭐⭐⭐</div>
                <div class="star-btn-label">3星版本</div>
                <div class="star-btn-desc">3项标准素材</div>
              </button>
              <button class="star-btn" onclick="Modal._loadPreset(0,this)">
                <div class="star-btn-icon">✍️</div>
                <div class="star-btn-label">自定义</div>
                <div class="star-btn-desc">手动添加需求</div>
              </button>
            </div>

            <!-- 预设需求列表工具栏 -->
            <div style="display:flex;justify-content:flex-end;margin-bottom:0.5rem">
              <button id="presetViewToggle" class="btn btn-ghost btn-sm" onclick="Modal._togglePresetView()" style="font-size:0.75rem;padding:0.25rem 0.75rem">⊞ 卡片视图</button>
            </div>
            <!-- 预设需求列表 -->
            <div class="preset-list" id="presetList">
              <div style="padding:2rem;text-align:center;color:var(--gray-400);font-size:0.875rem">
                👆 请先选择版本星级
              </div>
            </div>
            <button class="preset-add-btn" onclick="Modal._addPresetItem()">
              ➕ 手动添加一条需求
            </button>

            <!-- 公共设置 -->
            <div style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap">
              <div class="form-group" style="flex:1;min-width:160px">
                <label class="form-label">统一负责人</label>
                <input class="form-control" id="presetAssignee" placeholder="留空则每条单独设置">
              </div>
              <div class="form-group" style="flex:1;min-width:160px">
                <label class="form-label">统一截止日期</label>
                <input type="date" class="form-control" id="presetDueDate">
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalVersionForm')">取消</button>
          <button class="btn" onclick="Modal._saveVersion('${versionId||''}')">💾 保存版本${!v?' & 创建素材':''}</button>
        </div>
      </div>
    </div>`;
    this.create('modalVersionForm', html);
  },

  _vfSwitchTab(btn, paneId) {
    const modal = document.getElementById('modalVersionForm');
    modal.querySelectorAll('.vf-tab-btn').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('.vf-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(paneId).classList.add('active');
  },

  _loadPreset(stars, btn) {
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const list = document.getElementById('presetList');
    if (!list) return;
    const items = stars > 0 ? JSON.parse(JSON.stringify(STAR_PRESETS[stars] || [])) : [];
    this._renderPresetList(list, items);
  },

  _presetViewMode: 'list', // 'list' | 'card'

  _renderPresetList(list, items) {
    if (!items.length) {
      list.innerHTML = `<div style="padding:1.5rem;text-align:center;color:var(--gray-400);font-size:0.8rem">暂无需求，点击下方按钮添加</div>`;
      list._items = [];
      return;
    }
    list._items = items;
    const typeLabels = { design:'美术设计', art:'原画', video:'视频', copy:'文案', interactive:'交互/H5' };
    const typeColors = { design:'#8b5cf6', art:'#ec4899', video:'#ef4444', copy:'#6b7280', interactive:'#3b82f6' };
    const priorityColors = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' };
    const priorityLabels = { high:'高优', medium:'中', low:'低' };

    if (this._presetViewMode === 'card') {
      list.innerHTML = `<div class="preset-card-grid">${items.map((item, i) => `
        <div class="preset-card" id="pi_${i}">
          <div class="preset-card-head">
            <span class="preset-card-type" style="background:${typeColors[item.type]||'#6b7280'}22;color:${typeColors[item.type]||'#6b7280'};border:1px solid ${typeColors[item.type]||'#6b7280'}44">${typeLabels[item.type]||item.type}</span>
            <span class="preset-card-priority" style="color:${priorityColors[item.priority]||'#6b7280'}">${priorityLabels[item.priority]||''}</span>
            <button class="preset-del" style="margin-left:auto" onclick="Modal._removePresetItem(${i})" title="删除">✕</button>
          </div>
          <div class="preset-card-name">
            <input class="form-control" style="font-size:0.82rem;font-weight:600;padding:0.25rem 0.4rem" value="${item.name}"
              oninput="Modal._updatePresetItem(${i},'name',this.value)">
          </div>
          <div class="preset-card-footer">
            <select style="font-size:0.7rem;padding:0.2rem 0.3rem;border:1px solid var(--gray-300);border-radius:0.25rem;flex:1"
              onchange="Modal._updatePresetItem(${i},'type',this.value)">
              ${Object.entries(typeLabels).map(([v,l]) => `<option value="${v}" ${item.type===v?'selected':''}>${l}</option>`).join('')}
            </select>
            <span style="font-size:0.7rem;color:var(--gray-500)">×</span>
            <input type="number" min="1" max="99" class="form-control" style="width:44px;font-size:0.78rem;padding:0.2rem 0.3rem;text-align:center"
              value="${item.count||1}" oninput="Modal._updatePresetItem(${i},'count',parseInt(this.value)||1)" title="数量">
            <button class="preset-brief-toggle" style="font-size:0.68rem" onclick="Modal._toggleBrief(${i})">📝</button>
          </div>
          <div class="preset-brief-row" id="pbr_${i}">
            <textarea class="preset-brief-input" placeholder="制作需求说明..."
              oninput="Modal._updatePresetItem(${i},'brief',this.value)">${item.brief||''}</textarea>
          </div>
        </div>`).join('')}</div>`;
    } else {
      list.innerHTML = items.map((item, i) => `
        <div class="preset-item" id="pi_${i}">
          <span class="preset-drag">⠿</span>
          <input class="form-control preset-name" style="font-size:0.8rem;padding:0.3rem 0.5rem" value="${item.name}" oninput="Modal._updatePresetItem(${i},'name',this.value)" title="素材名称">
          <select style="font-size:0.72rem;padding:0.25rem;border:1px solid var(--gray-300);border-radius:0.375rem"
            onchange="Modal._updatePresetItem(${i},'type',this.value)" title="素材类型">
            ${Object.entries(typeLabels).map(([v,l]) => `<option value="${v}" ${item.type===v?'selected':''}>${l}</option>`).join('')}
          </select>
          <div style="display:flex;align-items:center;gap:0.25rem" title="数量">
            <span style="font-size:0.7rem;color:var(--gray-500)">×</span>
            <input type="number" min="1" max="99" class="form-control" style="width:48px;font-size:0.8rem;padding:0.3rem 0.4rem;text-align:center"
              value="${item.count||1}" oninput="Modal._updatePresetItem(${i},'count',parseInt(this.value)||1)" title="数量">
          </div>
          <button class="preset-brief-toggle" onclick="Modal._toggleBrief(${i})">📝 Brief</button>
          <button class="preset-del" onclick="Modal._removePresetItem(${i})" title="删除">✕</button>
          <div class="preset-brief-row" id="pbr_${i}">
            <textarea class="preset-brief-input" placeholder="填写该素材的制作需求说明..."
              oninput="Modal._updatePresetItem(${i},'brief',this.value)">${item.brief||''}</textarea>
          </div>
        </div>`).join('');
    }
  },

  _togglePresetView() {
    this._presetViewMode = this._presetViewMode === 'list' ? 'card' : 'list';
    const btn = document.getElementById('presetViewToggle');
    if (btn) btn.textContent = this._presetViewMode === 'card' ? '☰ 列表视图' : '⊞ 卡片视图';
    const list = document.getElementById('presetList');
    if (list && list._items) this._renderPresetList(list, list._items);
  },

  _updatePresetItem(idx, field, value) {
    const list = document.getElementById('presetList');
    if (list && list._items && list._items[idx]) list._items[idx][field] = value;
  },
  _toggleBrief(idx) {
    const row = document.getElementById(`pbr_${idx}`);
    if (row) row.classList.toggle('open');
  },
  _removePresetItem(idx) {
    const list = document.getElementById('presetList');
    if (!list || !list._items) return;
    list._items.splice(idx, 1);
    this._renderPresetList(list, list._items);
  },
  _addPresetItem() {
    const list = document.getElementById('presetList');
    if (!list) return;
    if (!list._items) list._items = [];
    list._items.push({ name: '新需求', type: 'design', priority: 'medium', brief: '' });
    this._renderPresetList(list, list._items);
    // 滚到最底
    list.scrollTop = list.scrollHeight;
  },

  _saveVersion(id) {
    const name = document.getElementById('vf_name').value.trim();
    if (!name) { Utils.toast('请填写版本名称', 'error'); return; }
    const data = {
      name, rank: document.getElementById('vf_rank').value,
      category: document.getElementById('vf_category').value.trim(),
      priority: document.getElementById('vf_priority').value,
      startDate: document.getElementById('vf_startDate').value,
      launchDate: document.getElementById('vf_launchDate').value,
      launchDate2: document.getElementById('vf_launchDate2').value,
      marketingOwner: document.getElementById('vf_marketingOwner').value.trim(),
      planningOwner: document.getElementById('vf_planningOwner').value.trim(),
      status: document.getElementById('vf_status').value,
      description: document.getElementById('vf_description').value.trim(),
    };
    let versionId = id;
    if (id) {
      DataManager.updateVersion(id, data);
      Utils.toast('版本已更新', 'success');
    } else {
      const v = DataManager.addVersion(data);
      versionId = v.id;
      Utils.toast('版本已创建', 'success');
      // 同时创建预设素材
      const list = document.getElementById('presetList');
      if (list && list._items && list._items.length) {
        const assignee = (document.getElementById('presetAssignee')?.value || '').trim();
        const dueDate  = document.getElementById('presetDueDate')?.value || '';
        let createdCount = 0;
        // 若有上线日期+等级，按排期倒推截止日
        let schedDueDate = dueDate;
        if (v.launchDate && v.rank && typeof calcVersionSchedule === 'function') {
          try {
            const sched = calcVersionSchedule(v.launchDate, v.rank);
            // 制作期素材截止 = 素材提交节点
            const submitMs = sched.milestones.find(m => m.key === 'submit');
            if (submitMs) schedDueDate = submitMs.date.toISOString().slice(0, 10);
          } catch (e) { /* 忽略 */ }
        }
        list._items.forEach(item => {
          const cnt = Math.max(1, parseInt(item.count) || 1);
          for (let n = 1; n <= cnt; n++) {
            DataManager.addMaterial({
              name: cnt > 1 ? `${item.name} (${n}/${cnt})` : item.name,
              type: item.type, priority: item.priority || 'medium',
              brief: item.brief || '', status: 'todo',
              assignee: assignee || '',
              // 若用户手动填了 dueDate 则用用户的，否则用排期推算的
              dueDate: dueDate || schedDueDate || '',
              versionId: v.id
            });
            createdCount++;
          }
        });
        const schedNote = schedDueDate && !dueDate ? `（排期截止日：${schedDueDate}）` : '';
        Utils.toast(`✅ 同时创建了 ${createdCount} 条素材需求 ${schedNote}`, 'success');
      }
    }
    this.close('modalVersionForm');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  // ==================== 版本详情弹窗 ====================
  openVersionDetail(versionId) {
    const v = DataManager.getVersion(versionId);
    if (!v) return;
    const mats = DataManager.getMaterialsByVersion(versionId);
    const done = mats.filter(m => m.status === 'done').length;
    const html = `
    <div class="modal-overlay active" id="modalVersionDetail">
      <div class="modal-box wide">
        <div class="modal-head">
          <h2>📦 ${v.name}</h2>
          <button class="modal-close" onclick="Modal.close('modalVersionDetail')">×</button>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <button class="tab-btn active" data-tab="vd_overview">概览</button>
            <button class="tab-btn" data-tab="vd_materials">素材清单 (${mats.length})</button>
            <button class="tab-btn" data-tab="vd_matgantt">📅 排期甘特图</button>
            <button class="tab-btn" data-tab="vd_progress">📊 进度编辑</button>
            <button class="tab-btn" data-tab="vd_timeline">时间线</button>
          </div>
          <!-- 概览 -->
          <div class="tab-pane active" id="vd_overview">
            <div class="detail-grid">
              <div class="detail-card">
                <h3>基本信息</h3>
                <dl class="dl-grid">
                  <dt>版本名称</dt><dd>${v.name}</dd>
                  <dt>所属分类</dt><dd>${v.category||'-'}</dd>
                  <dt>版本定级</dt><dd><span class="badge rank-${v.rank.toLowerCase()}">${v.rank}级</span></dd>
                  <dt>优先级</dt><dd>${v.priority||'-'}</dd>
                  <dt>开始日期</dt><dd>${v.startDate||'-'}</dd>
                  <dt>上线日期</dt><dd>${v.launchDate||'-'}${v.launchDate2?' / '+v.launchDate2:''}</dd>
                  <dt>当前状态</dt><dd><span class="badge ${Utils.statusClass(v.status)}">${Utils.statusLabel(v.status)}</span></dd>
                </dl>
              </div>
              <div class="detail-card">
                <h3>责任人</h3>
                <dl class="dl-grid">
                  <dt>责任营销</dt><dd>${v.marketingOwner||'-'}</dd>
                  <dt>责任策划</dt><dd>${v.planningOwner||'-'}</dd>
                </dl>
              </div>
              <div class="detail-card">
                <h3>进度统计</h3>
                <div style="text-align:center;padding:0.5rem 0">
                  <div style="font-size:2.5rem;font-weight:700;color:var(--primary)">${v.progress||0}%</div>
                  <div style="font-size:0.8rem;color:var(--gray-500)">整体完成度</div>
                </div>
                <div class="progress-bar" style="height:10px"><div class="progress-fill" style="width:${v.progress||0}%"></div></div>
                <div style="display:flex;justify-content:space-around;margin-top:1rem;text-align:center;font-size:0.8rem">
                  <div><div style="font-size:1.25rem;font-weight:700">${mats.length}</div>素材总数</div>
                  <div><div style="font-size:1.25rem;font-weight:700;color:var(--success)">${done}</div>已完成</div>
                  <div><div style="font-size:1.25rem;font-weight:700;color:var(--warning)">${mats.length-done}</div>待完成</div>
                </div>
              </div>
            </div>
            ${v.description?`<div class="detail-card"><h3>版本说明</h3><p style="font-size:0.875rem;color:var(--gray-700)">${v.description}</p></div>`:''}
          </div>
          <!-- 素材清单 -->
          <div class="tab-pane" id="vd_materials">
            <div style="margin-bottom:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
              <button class="btn btn-success btn-sm" onclick="Modal.close('modalVersionDetail');Modal.openMaterialForm(null,'${versionId}')">➕ 添加素材</button>
              <button class="btn btn-ghost btn-sm" onclick="DataManager.exportCSV()">📊 导出CSV</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>名称</th><th>类型</th><th>状态</th><th>负责人</th><th>优先级</th><th>截止日期</th><th>操作</th></tr></thead>
                <tbody>
                  ${mats.length ? mats.map(m => `
                    <tr onclick="Modal.openMaterialDetail('${m.id}')" style="cursor:pointer">
                      <td>${m.name}</td>
                      <td>${Utils.typeIcon(m.type)} ${Utils.typeLabel(m.type)}</td>
                      <td><span class="badge ${Utils.statusClass(m.status)}">${Utils.statusLabel(m.status)}</span></td>
                      <td>${m.assignee||'-'}</td>
                      <td><span class="badge ${Utils.priorityClass(m.priority)}">${Utils.priorityLabel(m.priority)}</span></td>
                      <td>${m.dueDate||'-'}</td>
                      <td onclick="event.stopPropagation()">
                        <button class="btn-icon" onclick="Modal.openMaterialForm('${m.id}')" title="编辑">✏️</button>
                        <button class="btn-icon" onclick="Modal._deleteMaterial('${m.id}','${versionId}')" title="删除">🗑️</button>
                      </td>
                    </tr>`).join('')
                  : '<tr><td colspan="7" class="empty-state">暂无素材</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
          <!-- 素材排期甘特图 -->
          <div class="tab-pane" id="vd_matgantt">
            <div class="mg-wrap-outer" style="padding:0.25rem 0">
              <div id="vd_matgantt_inner" class="mg-inner" style="min-height:120px">
                <div style="padding:2rem;text-align:center;color:var(--gray-400)">点击此标签加载排期甘特图…</div>
              </div>
            </div>
          </div>
          <!-- 进度编辑（时间线事件管理） -->
          <div class="tab-pane" id="vd_progress">
            <div class="tl-editor-wrap">
              <div class="tl-editor-toolbar">
                <span style="font-weight:600;font-size:0.875rem;color:var(--gray-700)">📝 时间线事件管理</span>
                <div style="display:flex;gap:0.5rem;margin-left:auto">
                  <button class="btn btn-ghost btn-sm" onclick="Modal._vdAutoCalc('${versionId}')">🔄 同步素材状态</button>
                  <button class="btn btn-success btn-sm" onclick="Modal._addTimelineEvent('${versionId}')">➕ 新增事件</button>
                </div>
              </div>
              <div id="vd_tl_events">${Modal._buildEditableTimeline(v, mats)}</div>
            </div>
          </div>
          <!-- 时间线（只读快照） -->
          <div class="tab-pane" id="vd_timeline">
            <div class="timeline">${Modal._buildTimeline(v, mats)}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalVersionDetail');Modal.openVersionForm('${versionId}')">✏️ 编辑版本</button>
          <button class="btn btn-danger" onclick="Modal._deleteVersion('${versionId}')">🗑️ 删除版本</button>
          <button class="btn btn-ghost" onclick="Modal.close('modalVersionDetail')">关闭</button>
        </div>
      </div>
    </div>`;
    const overlay = this.create('modalVersionDetail', html);
    this.initTabs(overlay, versionId);
  },

  // ── 同步素材状态到时间线事件
  _vdAutoCalc(versionId) {
    const v    = DataManager.getVersion(versionId);
    const mats = DataManager.getMaterialsByVersion(versionId);
    if (!v) return;
    // 自动生成/更新每条素材的状态事件
    const now   = new Date().toISOString();
    const events = v.timelineEvents ? [...v.timelineEvents] : [];
    mats.forEach(m => {
      const existing = events.findIndex(e => e.matId === m.id);
      const ev = {
        id: m.id + '_auto',
        matId: m.id,
        type: m.status,
        title: m.name,
        text: `负责人: ${m.assignee||'未分配'} · ${Utils.statusLabel(m.status)}`,
        time: m.updatedAt || now,
        auto: true
      };
      if (existing >= 0) events[existing] = ev;
      else events.push(ev);
    });
    // 更新进度百分比
    const donePct = mats.length ? Math.round(mats.filter(m=>m.status==='done').length/mats.length*100) : 0;
    DataManager.updateVersion(versionId, { timelineEvents: events, progress: donePct });
    // 刷新编辑面板
    const el = document.getElementById('vd_tl_events');
    if (el) el.innerHTML = Modal._buildEditableTimeline(DataManager.getVersion(versionId), mats);
    Utils.toast(`已同步 ${mats.length} 条素材状态，进度 ${donePct}%`, 'success');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  // ── 构建进度历史 HTML（版本/素材公用）
  _buildProgressLogHTML(log, entityType) {
    if (!log || !log.length) {
      return `<div class="pl-empty">暂无进度历史记录</div>`;
    }
    const statusLabel = { 'planning':'计划中','in-progress':'进行中','review':'审核中','done':'已完成','todo':'待开始' };
    // 反向遍历（最新在前）
    const items = [...log].reverse().map(entry => {
      const d = new Date(entry.time);
      const timeStr = d.toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}) + ' ' + d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
      const diffs = [];
      if (entityType === 'version') {
        if (entry._new && entry.progress !== entry._new.progress)
          diffs.push(`进度: <span class="pl-old">${entry.progress ?? '-'}%</span> → <span class="pl-new">${entry._new.progress ?? '-'}%</span>`);
        if (entry._new && entry.status !== entry._new.status)
          diffs.push(`状态: <span class="pl-old">${statusLabel[entry.status]||entry.status||'-'}</span> → <span class="pl-new">${statusLabel[entry._new.status]||entry._new.status||'-'}</span>`);
        if (entry._new && entry.launchDate !== entry._new.launchDate)
          diffs.push(`上线日: <span class="pl-old">${entry.launchDate||'-'}</span> → <span class="pl-new">${entry._new.launchDate||'-'}</span>`);
        if (entry._new && entry.note !== entry._new.note && (entry.note || entry._new.note))
          diffs.push(`备注: <span class="pl-old">${entry.note||'（空）'}</span> → <span class="pl-new">${entry._new.note||'（空）'}</span>`);
      } else {
        if (entry._new && entry.status !== entry._new.status)
          diffs.push(`状态: <span class="pl-old">${statusLabel[entry.status]||entry.status||'-'}</span> → <span class="pl-new">${statusLabel[entry._new.status]||entry._new.status||'-'}</span>`);
        if (entry._new && entry.dueDate !== entry._new.dueDate)
          diffs.push(`截止日: <span class="pl-old">${entry.dueDate||'-'}</span> → <span class="pl-new">${entry._new.dueDate||'-'}</span>`);
        if (entry._new && entry.note !== entry._new.note && (entry.note || entry._new.note))
          diffs.push(`备注: <span class="pl-old">${entry.note||'（空）'}</span> → <span class="pl-new">${entry._new.note||'（空）'}</span>`);
      }
      const diffHTML = diffs.length ? diffs.map(d => `<span class="pl-diff-item">${d}</span>`).join('') : '<span class="pl-diff-item" style="color:var(--gray-400)">字段无变化</span>';
      return `<div class="pl-item">
        <div class="pl-dot"></div>
        <div class="pl-body">
          <div class="pl-meta">
            <span class="pl-time">${timeStr}</span>
            <span class="pl-operator">👤 ${entry.operator||'系统'}</span>
          </div>
          <div class="pl-diffs">${diffHTML}</div>
        </div>
      </div>`;
    });
    return `<div class="pl-list">${items.join('')}</div>`;
  },

  // ── 构建可编辑时间线
  _buildEditableTimeline(v, mats) {
    const typeIcon  = { create:'🟢', 'in-progress':'🔵', review:'🟡', done:'✅', note:'📝', milestone:'🏁', risk:'⚠️' };
    const typeLabel = { create:'创建', 'in-progress':'进行中', review:'审核中', done:'已完成', note:'备注', milestone:'里程碑', risk:'风险' };
    const typeColor = { create:'#10b981', 'in-progress':'#3b82f6', review:'#f59e0b', done:'#10b981', note:'#8b5cf6', milestone:'#ef4444', risk:'#f97316' };

    // 合并：排期里程碑（系统生成）+ 版本存储的自定义事件
    const allEvents = [];

    // 系统排期里程碑
    if (v.launchDate && v.rank) {
      try {
        const sched = calcVersionSchedule(v.launchDate, v.rank);
        sched.milestones.forEach(m => {
          allEvents.push({
            id: `_sched_${m.key}`, type: 'milestone', title: m.name,
            text: `${m.icon} 自动排期里程碑 · ${v.rank}级版本`,
            time: m.date.toISOString(), auto: true, color: m.color
          });
        });
        // 各阶段开始
        sched.phases.forEach(p => {
          allEvents.push({
            id: `_phase_${p.key||p.name}`, type: 'note', title: `${p.name}开始`,
            text: `阶段时长 ${p.days} 天`,
            time: new Date(p.start).toISOString(), auto: true, color: p.color
          });
        });
      } catch(e) {}
    }
    // 版本创建事件
    if (v.createdAt) {
      allEvents.push({ id:'_create', type:'create', title:'版本创建', text: v.name, time: v.createdAt, auto:true });
    }
    // 自定义事件
    (v.timelineEvents||[]).filter(e => !e.auto).forEach(e => allEvents.push(e));
    // 素材自动事件
    mats.forEach(m => {
      allEvents.push({
        id: m.id+'_auto', matId: m.id, type: m.status, auto: true,
        title: m.name,
        text: `负责人: ${m.assignee||'未分配'} · ${Utils.statusLabel(m.status)}`,
        time: m.updatedAt || m.createdAt || new Date().toISOString()
      });
    });

    allEvents.sort((a,b) => new Date(b.time)-new Date(a.time));

    const logCount = (v.progressLog||[]).length;
    const progressLogSection = `
      <div class="pl-collapse" id="plCollapse_v">
        <button class="pl-toggle" onclick="(function(btn){const c=btn.closest('.pl-collapse');c.classList.toggle('open');})(this)">
          <span>📈 进度历史</span>
          <span class="pl-badge">${logCount}</span>
          <span class="pl-chevron">▶</span>
        </button>
        <div class="pl-panel">
          ${Modal._buildProgressLogHTML(v.progressLog, 'version')}
        </div>
      </div>`;

    if (!allEvents.length) return progressLogSection + `<div class="empty-state" style="padding:2rem">暂无事件，点击右上角新增</div>`;

    return progressLogSection + `<div class="tl-editable">
      ${allEvents.map(e => {
        const d    = new Date(e.time);
        const clr  = e.color || typeColor[e.type] || '#6b7280';
        const icon = typeIcon[e.type] || '📌';
        const lbl  = typeLabel[e.type] || e.type;
        return `<div class="tl-ed-item" id="tlev_${e.id}">
          <div class="tl-ed-dot" style="background:${clr}"></div>
          <div class="tl-ed-line"></div>
          <div class="tl-ed-body">
            <div class="tl-ed-head">
              <span class="tl-ed-type" style="background:${clr}22;color:${clr};border:1px solid ${clr}44">${icon} ${lbl}</span>
              <span class="tl-ed-time">${d.toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'})} ${d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</span>
              ${!e.auto ? `
                <div class="tl-ed-actions">
                  <button class="btn-icon" title="编辑" onclick="Modal._editTimelineEvent('${v.id}','${e.id}')">✏️</button>
                  <button class="btn-icon" title="删除" onclick="Modal._delTimelineEvent('${v.id}','${e.id}')">🗑️</button>
                </div>` : `<span style="font-size:0.62rem;color:var(--gray-400);margin-left:auto">系统</span>`}
            </div>
            <div class="tl-ed-title">${e.title}</div>
            ${e.text ? `<div class="tl-ed-text">${e.text}</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  // ── 新增自定义时间线事件
  _addTimelineEvent(versionId) {
    const html = `
    <div class="modal-overlay active" id="modalAddEvent">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-head">
          <h2>➕ 新增时间线事件</h2>
          <button class="modal-close" onclick="Modal.close('modalAddEvent')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">事件类型</label>
            <select class="form-control" id="evType">
              <option value="note">📝 备注</option>
              <option value="milestone">🏁 里程碑</option>
              <option value="risk">⚠️ 风险</option>
              <option value="done">✅ 完成节点</option>
              <option value="review">🔵 审核节点</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">事件标题 <span class="req">*</span></label>
            <input class="form-control" id="evTitle" placeholder="例：需求评审完成">
          </div>
          <div class="form-group">
            <label class="form-label">时间</label>
            <input type="datetime-local" class="form-control" id="evTime" value="${new Date().toISOString().slice(0,16)}">
          </div>
          <div class="form-group">
            <label class="form-label">备注说明</label>
            <textarea class="form-control" id="evText" rows="3" placeholder="可选，填写详情说明…"></textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalAddEvent')">取消</button>
          <button class="btn" onclick="Modal._saveNewEvent('${versionId}')">💾 保存</button>
        </div>
      </div>
    </div>`;
    this.create('modalAddEvent', html);
  },

  _saveNewEvent(versionId) {
    const title = document.getElementById('evTitle').value.trim();
    if (!title) { Utils.toast('标题不能为空', 'error'); return; }
    const v = DataManager.getVersion(versionId);
    const ev = {
      id: 'ev_' + Date.now(),
      type: document.getElementById('evType').value,
      title,
      time: new Date(document.getElementById('evTime').value).toISOString(),
      text: document.getElementById('evText').value.trim(),
      auto: false
    };
    const events = [...(v.timelineEvents||[]), ev];
    DataManager.updateVersion(versionId, { timelineEvents: events });
    this.close('modalAddEvent');
    const el = document.getElementById('vd_tl_events');
    if (el) {
      const v2 = DataManager.getVersion(versionId);
      const mats = DataManager.getMaterialsByVersion(versionId);
      el.innerHTML = Modal._buildEditableTimeline(v2, mats);
    }
    Utils.toast('事件已添加', 'success');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  _editTimelineEvent(versionId, evId) {
    const v  = DataManager.getVersion(versionId);
    const ev = (v.timelineEvents||[]).find(e => e.id === evId);
    if (!ev) return;
    const html = `
    <div class="modal-overlay active" id="modalEditEvent">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-head">
          <h2>✏️ 编辑时间线事件</h2>
          <button class="modal-close" onclick="Modal.close('modalEditEvent')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">事件类型</label>
            <select class="form-control" id="evType2">
              ${['note','milestone','risk','done','review'].map(t =>
                `<option value="${t}" ${ev.type===t?'selected':''}>${{note:'📝 备注',milestone:'🏁 里程碑',risk:'⚠️ 风险',done:'✅ 完成节点',review:'🔵 审核节点'}[t]||t}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">事件标题</label>
            <input class="form-control" id="evTitle2" value="${ev.title||''}">
          </div>
          <div class="form-group">
            <label class="form-label">时间</label>
            <input type="datetime-local" class="form-control" id="evTime2" value="${ev.time?ev.time.slice(0,16):''}">
          </div>
          <div class="form-group">
            <label class="form-label">备注说明</label>
            <textarea class="form-control" id="evText2" rows="3">${ev.text||''}</textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalEditEvent')">取消</button>
          <button class="btn" onclick="Modal._saveEditEvent('${versionId}','${evId}')">💾 保存</button>
        </div>
      </div>
    </div>`;
    this.create('modalEditEvent', html);
  },

  _saveEditEvent(versionId, evId) {
    const v = DataManager.getVersion(versionId);
    const events = (v.timelineEvents||[]).map(e => {
      if (e.id !== evId) return e;
      return { ...e,
        type:  document.getElementById('evType2').value,
        title: document.getElementById('evTitle2').value.trim(),
        time:  new Date(document.getElementById('evTime2').value).toISOString(),
        text:  document.getElementById('evText2').value.trim()
      };
    });
    DataManager.updateVersion(versionId, { timelineEvents: events });
    this.close('modalEditEvent');
    const el = document.getElementById('vd_tl_events');
    if (el) {
      const v2 = DataManager.getVersion(versionId);
      el.innerHTML = Modal._buildEditableTimeline(v2, DataManager.getMaterialsByVersion(versionId));
    }
    Utils.toast('事件已更新', 'success');
  },

  _delTimelineEvent(versionId, evId) {
    if (!confirm('确定删除该事件？')) return;
    const v = DataManager.getVersion(versionId);
    const events = (v.timelineEvents||[]).filter(e => e.id !== evId);
    DataManager.updateVersion(versionId, { timelineEvents: events });
    const el = document.getElementById('vd_tl_events');
    if (el) {
      const v2 = DataManager.getVersion(versionId);
      el.innerHTML = Modal._buildEditableTimeline(v2, DataManager.getMaterialsByVersion(versionId));
    }
    Utils.toast('事件已删除', 'success');
  },

  // ── 只读时间线（时间线标签用）
  _buildTimeline(v, mats) {
    const allEvents = [];
    if (v.launchDate && v.rank) {
      try {
        const sched = calcVersionSchedule(v.launchDate, v.rank);
        sched.milestones.forEach(m => allEvents.push({ time: m.date, type:'milestone', title: m.name, text: m.icon+' 排期里程碑' }));
      } catch(e) {}
    }
    if (v.createdAt) allEvents.push({ time: new Date(v.createdAt), type:'create', title:'版本创建', text: v.name });
    mats.forEach(m => allEvents.push({ time: new Date(m.updatedAt||m.createdAt||Date.now()), type: m.status, title: m.name, text:`负责人: ${m.assignee||'未分配'} · ${Utils.statusLabel(m.status)}` }));
    (v.timelineEvents||[]).filter(e=>!e.auto).forEach(e => allEvents.push({ time: new Date(e.time), type: e.type, title: e.title, text: e.text }));
    allEvents.sort((a,b)=>b.time-a.time);
    if (!allEvents.length) return '<div class="empty-state">暂无记录</div>';
    return allEvents.slice(0,30).map(e => `
      <div class="tl-item">
        <div class="tl-dot ${e.type}"></div>
        <div class="tl-content">
          <div class="tl-time">${new Date(e.time).toLocaleString('zh-CN')}</div>
          <div class="tl-title">${e.title}</div>
          <div class="tl-text">${e.text||''}</div>
        </div>
      </div>`).join('');
  },

  _deleteVersion(id) {
    if (!confirm('确定删除该版本及其所有素材？此操作不可恢复！')) return;
    DataManager.deleteVersion(id);
    this.closeAll();
    Utils.toast('版本已删除', 'success');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  _deleteMaterial(id, versionId) {
    if (!confirm('确定删除该素材？')) return;
    DataManager.deleteMaterial(id);
    this.close('modalVersionDetail');
    this.openVersionDetail(versionId);
    Utils.toast('素材已删除', 'success');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  // ==================== 素材表单 ====================
  openMaterialForm(materialId = null, defaultVersionId = null) {
    const m = materialId ? DataManager.getMaterial(materialId) : null;
    const title = m ? '编辑素材' : '新建素材';
    const vOptions = DataManager.versions.map(v =>
      `<option value="${v.id}" ${(m&&m.versionId===v.id)||defaultVersionId===v.id?'selected':''}>${v.name}</option>`
    ).join('');
    const html = `
    <div class="modal-overlay active" id="modalMaterialForm">
      <div class="modal-box">
        <div class="modal-head">
          <h2>${title}</h2>
          <button class="modal-close" onclick="Modal.close('modalMaterialForm')">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">素材名称 *</label>
              <input class="form-control" id="mf_name" value="${m?m.name:''}" placeholder="请输入素材名称">
            </div>
            <div class="form-group">
              <label class="form-label">所属版本 *</label>
              <select class="form-control" id="mf_versionId">${vOptions}</select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">素材类型</label>
              <select class="form-control" id="mf_type">
                ${[['design','美术设计'],['art','原画'],['video','视频'],['copy','文案'],['interactive','交互设计']]
                  .map(([val,lbl]) => `<option value="${val}" ${m&&m.type===val?'selected':''}>${lbl}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">当前状态</label>
              <select class="form-control" id="mf_status">
                ${[['todo','待开始'],['in-progress','进行中'],['review','审核中'],['done','已完成']]
                  .map(([val,lbl]) => `<option value="${val}" ${m&&m.status===val?'selected':''}>${lbl}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">负责人</label>
              <input class="form-control" id="mf_assignee" value="${m?m.assignee||'':''}" placeholder="负责人姓名">
            </div>
            <div class="form-group">
              <label class="form-label">优先级</label>
              <select class="form-control" id="mf_priority">
                ${[['high','高'],['medium','中'],['low','低']]
                  .map(([val,lbl]) => `<option value="${val}" ${m&&m.priority===val?'selected':''}>${lbl}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">截止日期</label>
            <input type="date" class="form-control" id="mf_dueDate" value="${m?m.dueDate||'':''}">
          </div>
          <div class="form-group">
            <label class="form-label">制作需求 Brief</label>
            <textarea class="form-control" id="mf_brief" rows="4" placeholder="详细描述素材的制作规格、尺寸、风格要求等...">${m?m.brief||'':''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea class="form-control" id="mf_note" rows="2" placeholder="其他备注信息...">${m?m.note||'':''}</textarea>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalMaterialForm')">取消</button>
          <button class="btn" onclick="Modal._saveMaterial('${materialId||''}')">💾 保存</button>
        </div>
      </div>
    </div>`;
    this.create('modalMaterialForm', html);
  },

  _saveMaterial(id) {
    const name = document.getElementById('mf_name').value.trim();
    if (!name) { Utils.toast('请填写素材名称', 'error'); return; }
    const data = {
      name, versionId: document.getElementById('mf_versionId').value,
      type: document.getElementById('mf_type').value,
      status: document.getElementById('mf_status').value,
      assignee: document.getElementById('mf_assignee').value.trim(),
      priority: document.getElementById('mf_priority').value,
      dueDate: document.getElementById('mf_dueDate').value,
      brief: document.getElementById('mf_brief').value.trim(),
      note: document.getElementById('mf_note').value.trim(),
    };
    if (id) { DataManager.updateMaterial(id, data); Utils.toast('素材已更新', 'success'); }
    else    { DataManager.addMaterial(data);          Utils.toast('素材已添加', 'success'); }
    this.close('modalMaterialForm');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  },

  // ==================== 素材详情弹窗（含图片预览） ====================
  openMaterialDetail(materialId) {
    const m = DataManager.getMaterial(materialId);
    if (!m) return;
    const v = DataManager.getVersion(m.versionId);
    const imgFiles  = (m.files||[]).filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));
    const otherFiles = (m.files||[]).filter(f => !/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name));

    const imgGrid = imgFiles.length ? `
      <div class="form-section-title" style="margin-top:1rem">🖼️ 图片预览</div>
      <div class="img-preview-grid">
        ${imgFiles.map(f => `
          <div class="img-preview-card">
            <img src="${f.data}" alt="${f.name}" loading="lazy">
            <div class="img-preview-overlay">
              <button class="img-overlay-btn" onclick="Modal._openLightbox('${f.data}','${f.name}')" title="查看大图">🔍</button>
              <button class="img-overlay-btn" onclick="Modal._downloadFile('${m.id}','${f.id}')" title="下载">⬇️</button>
              <button class="img-overlay-btn" onclick="Modal._removeFile('${m.id}','${f.id}')" title="删除">🗑️</button>
            </div>
          </div>`).join('')}
      </div>` : '';

    const fileList = otherFiles.length ? `
      <div class="form-section-title" style="margin-top:1rem">📎 附件文件</div>
      <div class="file-list">
        ${otherFiles.map(f => `
          <div class="file-item" id="fi_${f.id}">
            <span>${Utils.fileIcon(f.name)}</span>
            <span class="file-name">${f.name}</span>
            <span class="file-size">${Utils.fileSize(f.size)}</span>
            <button class="btn-icon" onclick="Modal._downloadFile('${m.id}','${f.id}')" title="下载">⬇️</button>
            <button class="btn-icon" onclick="Modal._removeFile('${m.id}','${f.id}')" title="删除">🗑️</button>
          </div>`).join('')}
      </div>` : '';

    const html = `
    <div class="modal-overlay active" id="modalMaterialDetail">
      <div class="modal-box wide">
        <div class="modal-head">
          <h2>${Utils.typeIcon(m.type)} ${m.name}</h2>
          <button class="modal-close" onclick="Modal.close('modalMaterialDetail')">×</button>
        </div>
        <div class="modal-body">
          <div class="tabs">
            <button class="tab-btn active" data-tab="md_info">基本信息</button>
            <button class="tab-btn" data-tab="md_media">文件/图片 (${(m.files||[]).length})</button>
            <button class="tab-btn" data-tab="md_comments">评论 (${(m.comments||[]).length})</button>
          </div>

          <!-- 基本信息 -->
          <div class="tab-pane active" id="md_info">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <dl class="dl-grid">
                <dt>素材名称</dt><dd>${m.name}</dd>
                <dt>所属版本</dt><dd>${v?v.name:'-'}</dd>
                <dt>素材类型</dt><dd>${Utils.typeLabel(m.type)}</dd>
                <dt>当前状态</dt><dd><span class="badge ${Utils.statusClass(m.status)}">${Utils.statusLabel(m.status)}</span></dd>
                <dt>负责人</dt><dd>${m.assignee||'未分配'}</dd>
                <dt>优先级</dt><dd><span class="badge ${Utils.priorityClass(m.priority)}">${Utils.priorityLabel(m.priority)}</span></dd>
                <dt>截止日期</dt><dd>${m.dueDate||'未设置'}</dd>
                <dt>创建时间</dt><dd>${Utils.formatDateTime(m.createdAt)}</dd>
                <dt>最后更新</dt><dd>${Utils.formatDateTime(m.updatedAt)}</dd>
              </dl>
              <div>
                ${m.brief ? `
                  <div style="background:var(--gray-50);border-radius:0.5rem;padding:1rem;font-size:0.825rem;">
                    <div style="font-weight:700;color:var(--gray-700);margin-bottom:0.5rem">📋 制作 Brief</div>
                    <div style="color:var(--gray-700);line-height:1.6;white-space:pre-wrap">${m.brief}</div>
                  </div>` : '<div style="color:var(--gray-400);font-size:0.8rem;padding:1rem">暂无制作 Brief</div>'}
                ${m.note ? `<div style="margin-top:0.75rem;font-size:0.8rem;color:var(--gray-600)"><b>备注：</b>${m.note}</div>` : ''}
              </div>
            </div>
            <!-- 进度历史折叠区 -->
            <div class="pl-collapse" id="plCollapse_m" style="margin-top:1rem">
              <button class="pl-toggle" onclick="(function(btn){const c=btn.closest('.pl-collapse');c.classList.toggle('open');})(this)">
                <span>📈 进度历史</span>
                <span class="pl-badge">${(m.progressLog||[]).length}</span>
                <span class="pl-chevron">▶</span>
              </button>
              <div class="pl-panel">
                ${Modal._buildProgressLogHTML(m.progressLog, 'material')}
              </div>
            </div>
          </div>

          <!-- 文件/图片 -->
          <div class="tab-pane" id="md_media">
            <div class="upload-area" id="mdUploadArea" onclick="Modal._triggerFileUpload('${m.id}')">
              <div style="font-size:2.5rem;margin-bottom:0.5rem">📁</div>
              <div style="font-weight:600">点击上传文件或图片</div>
              <div style="font-size:0.8rem;color:var(--gray-500);margin-top:0.25rem">支持图片、视频、文档、PSD 等所有格式，也可拖拽上传</div>
            </div>
            <input type="file" id="mdFileInput_${m.id}" multiple style="display:none"
              onchange="Modal._handleFileUpload('${m.id}',this.files)">
            ${imgGrid}
            ${fileList}
            ${!imgFiles.length && !otherFiles.length ? '<div class="empty-state" style="padding:1.5rem">暂无文件，点击上方区域上传</div>' : ''}
          </div>

          <!-- 评论 -->
          <div class="tab-pane" id="md_comments">
            <div id="mdCommentList">
              ${(m.comments||[]).length ? (m.comments||[]).map(c => `
                <div class="comment-item">
                  <div class="avatar">${c.author.charAt(0)}</div>
                  <div class="comment-body">
                    <div class="meta">
                      <span class="author">${c.author}</span>
                      <span class="time">${Utils.formatDateTime(c.time)}</span>
                    </div>
                    <div class="text">${c.text}</div>
                  </div>
                </div>`).join('')
              : '<div class="empty-state" style="padding:1rem">暂无评论</div>'}
            </div>
            <div class="comment-input-row">
              <textarea class="form-control" id="mdNewComment" placeholder="添加评论..."></textarea>
              <button class="btn" onclick="Modal._submitComment('${m.id}')">发送</button>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="Modal.close('modalMaterialDetail');Modal.openMaterialForm('${m.id}')">✏️ 编辑素材</button>
          <button class="btn btn-danger" onclick="Modal._confirmDeleteMaterial('${m.id}')">🗑️ 删除素材</button>
          <button class="btn btn-ghost" onclick="Modal.close('modalMaterialDetail')">关闭</button>
        </div>
      </div>
    </div>`;
    const overlay = this.create('modalMaterialDetail', html);
    this.initTabs(overlay);
    // 拖拽上传
    const area = overlay.querySelector('#mdUploadArea');
    if (area) {
      area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
      area.addEventListener('dragleave', () => area.classList.remove('dragover'));
      area.addEventListener('drop', e => {
        e.preventDefault(); area.classList.remove('dragover');
        Modal._handleFileUpload(m.id, e.dataTransfer.files);
      });
    }
  },

  // ---- 灯箱大图 ----
  _openLightbox(src, name) {
    let lb = document.getElementById('globalLightbox');
    if (!lb) {
      document.body.insertAdjacentHTML('beforeend', `
        <div class="lightbox" id="globalLightbox" onclick="if(event.target===this)this.classList.remove('active')">
          <button class="lightbox-close" onclick="document.getElementById('globalLightbox').classList.remove('active')">✕</button>
          <img id="lightboxImg" src="" alt="">
        </div>`);
      lb = document.getElementById('globalLightbox');
    }
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxImg').alt = name;
    lb.classList.add('active');
  },

  _triggerFileUpload(materialId) {
    document.getElementById(`mdFileInput_${materialId}`).click();
  },
  _handleFileUpload(materialId, files) {
    let count = 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const ref = { id: Utils.uuid(), name: file.name, size: file.size,
                      type: file.type, uploadAt: new Date().toISOString(), data: e.target.result };
        DataManager.addFile(materialId, ref);
        count++;
        if (count === files.length) {
          Modal.close('modalMaterialDetail');
          Modal.openMaterialDetail(materialId);
          Utils.toast(`✅ 上传了 ${count} 个文件`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  },
  _downloadFile(materialId, fileId) {
    const m = DataManager.getMaterial(materialId);
    const file = (m&&m.files||[]).find(f => f.id === fileId);
    if (!file||!file.data) { Utils.toast('文件不存在', 'error'); return; }
    const a = document.createElement('a');
    a.href = file.data; a.download = file.name; a.click();
  },
  _removeFile(materialId, fileId) {
    if (!confirm('确定删除此文件？')) return;
    DataManager.deleteFile(materialId, fileId);
    Modal.close('modalMaterialDetail');
    Modal.openMaterialDetail(materialId);
    Utils.toast('文件已删除', 'success');
  },
  _submitComment(materialId) {
    const input = document.getElementById('mdNewComment');
    const text = input.value.trim();
    if (!text) { Utils.toast('请输入评论内容', 'error'); return; }
    DataManager.addComment(materialId, text);
    Modal.close('modalMaterialDetail');
    Modal.openMaterialDetail(materialId);
    Utils.toast('评论已发送', 'success');
  },
  _confirmDeleteMaterial(id) {
    if (!confirm('确定删除该素材？')) return;
    DataManager.deleteMaterial(id);
    this.closeAll();
    Utils.toast('素材已删除', 'success');
    if (typeof renderCurrentPage === 'function') renderCurrentPage();
  }
};

// Esc 关闭弹窗/灯箱
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('globalLightbox');
    if (lb && lb.classList.contains('active')) { lb.classList.remove('active'); return; }
    Modal.closeAll();
  }
});