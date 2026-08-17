const CARD_VERSION = '4.1.3';

// ══════════════════════════════════════════════════════════
//  EDITOR
// ══════════════════════════════════════════════════════════
class WaterTankCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._rendered = true; this._render(); }
    else { this.shadowRoot.querySelectorAll('ha-entity-picker[data-picker]').forEach(p => { p.hass = hass; }); }
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) this._updateValues();
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _picker(field) {
    return `<ha-entity-picker data-field="${field}" data-picker="true" allow-custom-entity></ha-entity-picker>`;
  }

  _updateValues() {
    const c = this._config;
    const set = (f, v) => { const el = this.shadowRoot.querySelector(`[data-field="${f}"]`); if (el && document.activeElement !== el) el.value = v || ''; };
    set('title', c.title); set('mode', c.mode || 'compact');
    set('tank_capacity', c.tank_capacity || ''); set('warn_below', c.warn_below ?? 50);
    set('tank_color', c.tank_color || c.fill_color || '#1a78c2');
    set('pump_confirmation', c.pump_confirmation); set('navigate_to', c.navigate_to);
    set('tap_action', c.tap_action || 'navigate'); set('hold_action', c.hold_action || 'toggle-pump');
    ['entity_level','pump_entity','history_entity','entity_liters',
     'entity_daily_used','entity_pump_today','entity_power',
     'entity_daily_kwh','entity_monthly_kwh'].forEach(f => {
      const p = this.shadowRoot.querySelector(`ha-entity-picker[data-field="${f}"]`);
      if (p && p.value !== (c[f] || '')) p.value = c[f] || '';
    });
  }

  _render() {
    const c = this._config;
    const sel = (f, opts) => `<select data-field="${f}">${opts}</select>`;
    const opt = (v, l, cur) => `<option value="${v}"${cur === v ? ' selected' : ''}>${l}</option>`;
    const actionOpts = (cur) => ['navigate','toggle-pump','more-info','none']
      .map(v => opt(v, {navigate:'Navigate','toggle-pump':'Toggle pump','more-info':'More info',none:'None'}[v], cur)).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block}
        .ed{display:flex;flex-direction:column;gap:12px;padding:4px 0}
        label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--primary-text-color)}
        label span{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--secondary-text-color)}
        input,select{padding:6px 8px;border-radius:6px;border:1px solid var(--divider-color,#ccc);background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:13px;width:100%;box-sizing:border-box}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .sec{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--secondary-text-color);border-bottom:1px solid var(--divider-color,#eee);padding-bottom:3px;margin-top:4px}
        input[type=color]{height:34px;padding:2px 4px;cursor:pointer}
      </style>
      <div class="ed">
        <div class="sec">Required</div>
        <label><span>Tank Level Entity (%)</span>${this._picker('entity_level')}</label>

        <div class="sec">Display</div>
        <div class="row">
          <label><span>Title</span><input type="text" data-field="title" value="${c.title||''}"></label>
          <label><span>Mode</span>${sel('mode',['compact','medium','full'].map(v=>opt(v,v[0].toUpperCase()+v.slice(1),c.mode||'compact')).join(''))}</label>
        </div>
        <div class="row">
          <label><span>Tank Capacity (L)</span><input type="number" data-field="tank_capacity" value="${c.tank_capacity||''}" placeholder="5000"></label>
          <label><span>Warn Below (%)</span><input type="number" data-field="warn_below" value="${c.warn_below??50}" placeholder="50"></label>
        </div>
        <label><span>Fill Colour</span><input type="color" data-field="tank_color" value="${c.tank_color||c.fill_color||'#1a78c2'}"></label>

        <div class="sec">Pump</div>
        <label><span>Pump Entity</span>${this._picker('pump_entity')}</label>
        <label><span>Confirmation Message</span><input type="text" data-field="pump_confirmation" value="${c.pump_confirmation||''}" placeholder="Are you sure?"></label>

        <div class="sec">Actions</div>
        <div class="row">
          <label><span>Tap</span>${sel('tap_action', actionOpts(c.tap_action||'navigate'))}</label>
          <label><span>Hold</span>${sel('hold_action', actionOpts(c.hold_action||'toggle-pump'))}</label>
        </div>
        <label><span>Navigate To</span><input type="text" data-field="navigate_to" value="${c.navigate_to||''}" placeholder="/lovelace/jojo"></label>

        <div class="sec">Stats Panel (Full mode)</div>
        <label><span>Litres Left Entity</span>${this._picker('entity_liters')}</label>
        <label><span>Daily Water Used Entity</span>${this._picker('entity_daily_used')}</label>
        <label><span>Pump On Today Entity</span>${this._picker('entity_pump_today')}</label>
        <label><span>Borehole Power Entity</span>${this._picker('entity_power')}</label>
        <label><span>Daily kWh Entity</span>${this._picker('entity_daily_kwh')}</label>
        <label><span>Monthly kWh Entity</span>${this._picker('entity_monthly_kwh')}</label>

        <div class="sec">Toggles Panel (Full mode — right column)</div>
        <label><span>Toggles YAML (paste entity list)</span>
          <textarea data-field="toggles_yaml" rows="5" style="font-size:11px;font-family:monospace;padding:6px;border-radius:6px;border:1px solid var(--divider-color,#ccc);background:var(--card-background-color,#fff);color:var(--primary-text-color);width:100%;box-sizing:border-box;resize:vertical">${c.toggles ? c.toggles.map(t=>typeof t==='string'?'- entity: '+t:'- entity: '+t.entity+(t.name?'\n  name: '+t.name:'')+(t.icon?'\n  icon: '+t.icon:'')).join('\n') : ''}</textarea>
        </label>
        <div class="sec">History Sparkline</div>
        <label><span>History Entity</span>${this._picker('history_entity')}</label>
      </div>`;

    this.shadowRoot.querySelectorAll('[data-field]:not([data-picker])').forEach(el => {
      el.addEventListener(el.type === 'color' ? 'input' : 'change', e => {
        const f = e.target.dataset.field, v = e.target.value;
        if (v === '') { const c2={...this._config}; delete c2[f]; this._config=c2; }
        else this._config = {...this._config, [f]: ['tank_capacity','warn_below'].includes(f) ? parseFloat(v) : v};
        this._dispatch();
      });
    });
    this.shadowRoot.querySelectorAll('ha-entity-picker[data-picker]').forEach(p => {
      const f = p.dataset.field;
      if (this._hass) p.hass = this._hass;
      p.value = this._config[f] || '';
      p.addEventListener('value-changed', e => {
        const v = e.detail.value;
        if (!v) { const c2={...this._config}; delete c2[f]; this._config=c2; }
        else this._config = {...this._config, [f]: v};
        this._dispatch();
      });
    });
  }
}
customElements.define('water-tank-card-editor', WaterTankCardEditor);

// ══════════════════════════════════════════════════════════
//  MAIN CARD
// ══════════════════════════════════════════════════════════
class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._config = null;
    this._holdTimer = null;
    this._isHold = false;
    this._history = [];
    this._lastPct = null;
    this._lastPumpOn = null;
    this._lastMode = null;
    this._pumpStartTime = null;
    this._tickTimer = null;
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() { return { entity_level: '', title: 'Jojo', mode: 'compact' }; }
  static getConfigElement() { return document.createElement('water-tank-card-editor'); }

  setConfig(config) {
    if (!config.entity_level) throw new Error('entity_level is required');
    this._config = config;
    this._lastPct = null; this._lastPumpOn = null; this._lastMode = null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const level = hass.states[this._config.entity_level];
    const pctRaw = level && level.state !== 'unknown' && level.state !== 'unavailable'
      ? Math.round(parseFloat(String(level.state).match(/[\d.]+/)?.[0]) || 0) : -1;
    const pe = this._config.pump_entity;
    const pump = pe ? hass.states[pe] : null;
    const pumpOn = pump ? pump.state === 'on' : false;
    const mode = this._config.mode || 'compact';

    // Track pump start time for runtime counter
    if (pumpOn && !this._lastPumpOn) {
      this._pumpStartTime = pump.last_changed ? new Date(pump.last_changed) : new Date();
      this._startTick();
    } else if (!pumpOn) {
      this._stopTick();
      this._pumpStartTime = null;
    }

    if (pctRaw === this._lastPct && pumpOn === this._lastPumpOn && mode === this._lastMode) return;
    this._lastPct = pctRaw; this._lastPumpOn = pumpOn; this._lastMode = mode;
    this._render();

    if (mode === 'full' || mode === 'medium') {
      const now = Date.now();
      if (!this._lastHistoryFetch || now - this._lastHistoryFetch > 60000) {
        this._lastHistoryFetch = now;
        this._fetchHistory();
      }
    }
  }

  // Tick every 60s to update pump runtime + last-updated without full re-render
  _startTick() {
    if (this._tickTimer) return;
    this._tickTimer = setInterval(() => this._updateTickers(), 60000);
  }
  _stopTick() { if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; } }

  _updateTickers() {
    const rEl = this.shadowRoot.querySelector('.pump-runtime');
    if (rEl && this._pumpStartTime) rEl.textContent = this._runtimeText();
    const uEl = this.shadowRoot.querySelector('.last-updated');
    if (uEl) uEl.textContent = this._updatedText();
  }

  _runtimeText() {
    if (!this._pumpStartTime) return '';
    const mins = Math.round((Date.now() - this._pumpStartTime.getTime()) / 60000);
    return mins < 60 ? `Pump running ${mins} min` : `Pump running ${Math.floor(mins/60)}h ${mins%60}m`;
  }

  _updatedText() {
    if (!this._hass || !this._config) return '';
    const level = this._hass.states[this._config.entity_level];
    if (!level || !level.last_changed) return '';
    const mins = Math.round((Date.now() - new Date(level.last_changed).getTime()) / 60000);
    if (mins < 1) return 'Updated just now';
    if (mins < 60) return `Updated ${mins} min ago`;
    return `Updated ${Math.floor(mins/60)}h ${mins%60}m ago`;
  }

  getCardSize() {
    const m = this._config ? this._config.mode : 'compact';
    if (m === 'full') return 8;
    if (m === 'medium') return 5;
    return 2;
  }
  getGridOptions() {
    const m = this._config ? this._config.mode : 'compact';
    if (m === 'full') return { columns:6,rows:8,min_columns:3,min_rows:5,max_columns:12,max_rows:14 };
    if (m === 'medium') return { columns:6,rows:5,min_columns:3,min_rows:3,max_columns:12,max_rows:12 };
    return { columns:3,rows:2,min_columns:2,min_rows:2,max_columns:6,max_rows:4 };
  }

  async _fetchHistory() {
    if (!this._hass || !this._config) return;
    const id = this._config.history_entity || this._config.entity_level;
    const end = new Date(), start = new Date(end - 86400000);
    try {
      const res = await this._hass.callApi('GET',
        `history/period/${start.toISOString()}?filter_entity_id=${id}&end_time=${end.toISOString()}&minimal_response=true&no_attributes=true`);
      if (res?.[0]?.length > 1) {
        this._history = res[0]
          .filter(s => s.state !== 'unknown' && s.state !== 'unavailable')
          .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
          .filter(s => !isNaN(s.v));
        this._render();
      }
    } catch (_) {}
  }

  _sparklineSvg(history, w=260, h=36) {
    if (!history || history.length < 2) return '';
    const vals = history.map(h => h.v);
    const minV = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
    const minT = history[0].t, tRange = history[history.length-1].t - minT || 1;
    const px = t => ((t-minT)/tRange*w).toFixed(1);
    const py = v => (h-4-((v-minV)/range*(h-8))).toFixed(1);
    const pts = history.map(h => `${px(h.t)},${py(h.v)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${h}px;display:block;opacity:.7;margin-top:4px">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#42a5f5" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#42a5f5" stop-opacity="0"/>
      </linearGradient></defs>
      <polygon points="${pts} ${w},${h} 0,${h}" fill="url(#sg)"/>
      <polyline points="${pts}" fill="none" stroke="#42a5f5" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }

  _fireMoreInfo(id) { this.dispatchEvent(new CustomEvent('hass-more-info',{bubbles:true,composed:true,detail:{entityId:id}})); }
  _fillStyle(p, cc) {
    if (cc) return { fill:cc, glow:cc };
    return { fill:'url(#fg)', glow: p>60?'#43a047':p>30?'#fbc02d':'#e53935' };
  }

  _litresText(p, c, hass) {
    if (c.entity_liters) {
      const s = hass.states[c.entity_liters];
      if (s && s.state !== 'unknown' && s.state !== 'unavailable') {
        const m = String(s.state).match(/[\d.]+/);
        if (m) return `${Math.round(parseFloat(m[0]))} ${s.attributes?.unit_of_measurement||'L'}`;
      }
    }
    if (c.tank_capacity) return `${Math.round((p/100)*parseFloat(c.tank_capacity)).toLocaleString()} L`;
    return '';
  }

  _stateVal(entityId, decimals = 0) {
    if (!entityId || !this._hass) return '—';
    const s = this._hass.states[entityId];
    if (!s || s.state === 'unknown' || s.state === 'unavailable') return '—';
    const n = parseFloat(s.state);
    return isNaN(n) ? s.state : (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString());
  }

  _minsText(entityId) {
    if (!entityId || !this._hass) return '—';
    const s = this._hass.states[entityId];
    if (!s || s.state === 'unknown' || s.state === 'unavailable') return '—';
    const val = parseFloat(s.state);
    if (isNaN(val)) return s.state;
    const unit = (s.attributes?.unit_of_measurement || '').toLowerCase();
    let totalMins;
    if (unit === 'h' || unit === 'hr' || unit === 'hours') {
      totalMins = Math.round(val * 60);
    } else if (unit === 's' || unit === 'sec' || unit === 'seconds') {
      totalMins = Math.round(val / 60);
    } else if (val !== Math.floor(val) && val < 24 && unit !== 'min' && unit !== 'minutes') {
      // decimal with no unit and < 24 — treat as decimal hours (e.g. 2.45 = 2h27m)
      totalMins = Math.round(val * 60);
    } else {
      totalMins = Math.round(val);
    }
    if (totalMins < 60) return `${totalMins} min`;
    const h = Math.floor(totalMins / 60), m = totalMins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  _navigate() {
    const nav = this._config?.navigate_to;
    if (nav) { window.history.pushState(null,'',nav); window.dispatchEvent(new Event('location-changed')); }
  }
  _togglePump() {
    if (!this._hass || !this._config?.pump_entity) return;
    const msg = this._config.pump_confirmation || 'Are you sure you want to Toggle the Borehole Pump?';
    if (confirm(msg)) this._hass.callService('switch','toggle',{entity_id:this._config.pump_entity});
  }
  _runAction(key) {
    const a = this._config[key] || (key==='tap_action'?'navigate':'toggle-pump');
    if (a==='navigate') this._navigate();
    else if (a==='toggle-pump') this._togglePump();
    else if (a==='more-info') this._fireMoreInfo(this._config.entity_level);
  }
  _handleTap()  { if (this._hass && this._config) this._runAction('tap_action'); }
  _handleHold() { if (this._hass && this._config) this._runAction('hold_action'); }

  _bindEvents() {
    const el = this.shadowRoot.querySelector('.card-touch');
    if (!el || el._bound) return;
    el._bound = true;
    el.addEventListener('pointerdown', () => {
      this._isHold = false;
      this._holdTimer = setTimeout(() => { this._isHold=true; this._handleHold(); }, 500);
    });
    el.addEventListener('pointerup', () => { clearTimeout(this._holdTimer); if (!this._isHold) this._handleTap(); });
    el.addEventListener('pointerleave', () => clearTimeout(this._holdTimer));
  }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const c = this._config;
    const mode = c.mode || 'compact';
    const level = this._hass.states[c.entity_level];
    const title = c.title || 'Water Tank';
    const warnBelow = c.warn_below ?? 50;

    // ── Unavailable state ───────────────────────────────────
    if (!level || level.state === 'unavailable' || level.state === 'unknown') {
      this.shadowRoot.innerHTML = `
        <style>:host{display:block}ha-card{display:flex;align-items:center;justify-content:center;min-height:110px;background:var(--card-background-color)!important;border:1px solid var(--divider-color)!important}</style>
        <ha-card><div style="text-align:center;color:var(--secondary-text-color);font-size:13px">
          <div style="font-size:28px;margin-bottom:6px">📡</div>
          <div>${title}</div><div style="font-size:11px;margin-top:3px">Sensor unavailable</div>
        </div></ha-card>`;
      return;
    }

    let pct = Math.min(100, Math.max(0, parseFloat(String(level.state).match(/[\d.]+/)?.[0]) || 0));
    const p = Math.round(pct);
    const isLow = p < warnBelow;

    const cc = c.tank_color || c.fill_color || null;
    const { fill, glow } = this._fillStyle(p, cc);
    const litresText = this._litresText(p, c, this._hass);
    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump?.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : 'none';

    // ── SVG geometry ────────────────────────────────────────
    const L=60,R=240,domeY=50,topY=72,botY=330,cR=14;
    const fillY = botY - (pct/100)*(botY-topY);
    const tankPath = `M ${L},${topY} Q ${L},${domeY-5} 150,${domeY-10} Q ${R},${domeY-5} ${R},${topY} L ${R},${botY-cR} Q ${R},${botY} ${R-cR},${botY} L ${L+cR},${botY} Q ${L},${botY} ${L},${botY-cR} Z`;
    let ribs=''; for(let i=1;i<=6;i++){const ry=topY+i*(botY-topY)/7;ribs+=`<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>`;}
    const pumpY = Math.max(domeY+15, fillY-30);
    const pumpPath = `<path d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" fill="${pumpColor}"/>`;
    const lid = `<path d="M 130,${domeY-10} L 130,${domeY-22} Q 130,${domeY-26} 134,${domeY-26} L 166,${domeY-26} Q 170,${domeY-26} 170,${domeY-22} L 170,${domeY-10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
      <rect x="141" y="${domeY-31}" width="18" height="6" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.3"/>`;
    const gc = glow.startsWith('#') ? glow : '#43a047';
    const glowFlt = `<filter id="wg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" result="b"/><feFlood flood-color="${gc}" flood-opacity=".4" result="c"/><feComposite in="c" in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

    const svgDefs = `<defs>
      <linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#d32f2f"/><stop offset="15%" stop-color="#e53935"/>
        <stop offset="30%" stop-color="#f57c00"/><stop offset="50%" stop-color="#fbc02d"/>
        <stop offset="70%" stop-color="#cddc39"/><stop offset="85%" stop-color="#66bb6a"/>
        <stop offset="100%" stop-color="#43a047"/>
      </linearGradient>
      <clipPath id="tc"><path d="${tankPath}"/></clipPath>
      <filter id="ts"><feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="rgba(0,0,0,0.75)"/></filter>
      ${glowFlt}
    </defs>`;
    const svgBody = `
      <g clip-path="url(#tc)">
        <rect x="${L}" y="${fillY}" width="${R-L}" height="${botY-fillY}" fill="${fill}" opacity=".92" filter="url(#wg)"/>
        ${pct>2?`<g class="wl"><path d="M ${L-10},${fillY} q 12,-6 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 L ${R+10},${fillY+10} L ${L-10},${fillY+10} Z" fill="rgba(255,255,255,0.13)"/></g>`:''}
      </g>
      <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5"/>
      ${ribs}${lid}`;

    // ════════ COMPACT ════════
    if (mode === 'compact') {
      this.shadowRoot.innerHTML = `
        <style>
          :host{display:block}
          ha-card{height:110px;border-radius:18px!important;background:var(--card-background-color,rgba(30,30,30,.35))!important;backdrop-filter:blur(10px);border:1px solid var(--divider-color,rgba(255,255,255,.08))!important;box-shadow:none!important;overflow:visible;padding:0;position:relative}
          .card-touch{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;gap:2px;padding-bottom:12px}
          .tank-svg{display:block;height:68px;width:auto}
          @keyframes wv{0%{transform:translateX(0)}100%{transform:translateX(-100px)}}
          .wl{animation:wv 4s linear infinite}
          .tank-label{font-size:17px;font-weight:600;color:${isLow?'var(--error-color,#ef4444)':'var(--primary-text-color,rgba(255,255,255,.9))'};line-height:1}
          .pump-badge{position:absolute;top:6px;right:8px;width:20px;height:20px;z-index:10}
          .pump-badge svg{width:100%;height:100%}
          .warn-badge{position:absolute;top:6px;left:8px;font-size:14px;z-index:10;animation:wb .9s infinite}
          @keyframes wb{0%,100%{opacity:1}50%{opacity:.3}}
          ${pumpOn?'@keyframes pp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.15)}}.pump-badge{animation:pp .8s infinite}':''}
        </style>
        <ha-card>
          ${isLow?'<div class="warn-badge">⚠️</div>':''}
          ${pe?`<div class="pump-badge"><svg viewBox="0 0 24 24">${pumpPath}</svg></div>`:''}
          <div class="card-touch">
            <svg class="tank-svg" viewBox="20 10 260 340" xmlns="http://www.w3.org/2000/svg">
              ${svgDefs}${svgBody}
            </svg>
            <div class="tank-label">${title} — ${p}%</div>
          </div>
        </ha-card>`;
      this._bindEvents();
      return;
    }

    // ════════ MEDIUM / FULL ════════
    const isMedium = mode === 'medium';
    const gridCols = isMedium ? '1fr 1fr' : '1fr';
    const tankPad = isMedium ? '12px 8px 12px 12px' : '12px 12px 8px 12px';
    const tankMaxW = isMedium ? '260px' : '380px';
    const infoBorderCss = isMedium
      ? 'border-left:1px solid var(--divider-color,rgba(255,255,255,.08))'
      : 'border-top:1px solid var(--divider-color,rgba(255,255,255,.08))';
    const infoPad = isMedium ? '12px 12px 12px 8px' : '12px';
    const sparkline = this._sparklineSvg(this._history);
    const updatedText = this._updatedText();
    const runtimeText = pumpOn ? this._runtimeText() : '';

    // Stats rows
    const row = (icon, label, val, unit='') =>
      `<div class="stat-row"><span class="stat-icon">${icon}</span><span class="stat-label">${label}</span><span class="stat-val">${val}${unit?' <small>'+unit+'</small>':''}</span></div>`;

    const litresVal = c.entity_liters && this._stateVal(c.entity_liters) !== '—'
      ? this._stateVal(c.entity_liters) : litresText.replace(' L','').replace(',','');

    const statsPanel = `
      <div class="stats-panel">
        ${row('💧','Litres left',  litresVal, 'L')}
        ${row('🚿','Used today',   this._stateVal(c.entity_daily_used), 'L')}
        ${row('⏱️','Pump today',   this._minsText(c.entity_pump_today))}
        ${row('⚡','Power now',    this._stateVal(c.entity_power, 2), 'kW')}
        ${row('📅','Daily kWh',    this._stateVal(c.entity_daily_kwh, 2), 'kWh')}
        ${row('📆','Monthly kWh',  this._stateVal(c.entity_monthly_kwh, 2), 'kWh')}
      </div>`;

    // Toggles panel — entities listed under `toggles` config key
    const toggles = c.toggles || [];
    const toggleRows = toggles.map(t => {
      const eid = typeof t === 'string' ? t : t.entity;
      const lbl = (typeof t === 'object' && t.name) || (this._hass.states[eid]?.attributes?.friendly_name) || eid;
      const icon = (typeof t === 'object' && t.icon) || null;
      const s = this._hass.states[eid];
      const on = s?.state === 'on';
      const iconHtml = icon
        ? `<ha-icon icon="${icon}" style="color:${on?'var(--state-icon-active-color,#fbc02d)':'var(--disabled-color,rgba(255,255,255,.3))'}"></ha-icon>`
        : `<span style="width:24px;display:inline-block"></span>`;
      return `<div class="toggle-row" data-entity="${eid}">
        <span class="tog-icon">${iconHtml}</span>
        <span class="tog-label">${lbl}</span>
        <button class="tog-btn ${on?'on':''}" data-entity="${eid}" aria-checked="${on}">${on?'ON':'OFF'}</button>
      </div>`;
    }).join('');

    const togglesPanel = toggleRows ? `<div class="toggles-panel">${toggleRows}</div>` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block}
        ha-card{overflow:hidden;background:var(--card-background-color,transparent)!important;border:1px solid var(--divider-color,rgba(255,255,255,.08))!important;box-shadow:var(--ha-card-box-shadow,none)!important}
        .card-wrap{display:grid;grid-template-columns:${gridCols};gap:0;user-select:none;-webkit-user-select:none;touch-action:manipulation;position:relative;min-height:300px}
        /* Tank column */
        .tank-col{padding:${tankPad};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer}
        .tank-title{text-align:center;font-size:15px;font-weight:600;color:var(--primary-text-color,#fff);margin-bottom:4px}
        .tank-svg{display:block;width:100%;max-width:${tankMaxW};margin:0 auto}
        .litres-row{text-align:center;margin-top:4px;font-size:14px;color:var(--secondary-text-color,rgba(255,255,255,.6))}
        .last-updated{text-align:center;font-size:11px;color:var(--secondary-text-color,rgba(255,255,255,.35));margin-top:3px}
        .pump-runtime{text-align:center;font-size:12px;font-weight:600;color:#ef4444;margin-top:5px;background:rgba(239,68,68,.12);border-radius:12px;padding:2px 10px;width:100%;box-sizing:border-box}
        .warn-bar{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);border-radius:8px;padding:5px 8px;margin:5px 0;text-align:center;font-size:11px;font-weight:600;color:#ef4444;animation:wb .9s infinite;width:100%;box-sizing:border-box}
        .sparkline-wrap{padding:0 4px 2px;width:100%;box-sizing:border-box}
        .sparkline-label{font-size:10px;color:var(--secondary-text-color,rgba(255,255,255,.35));text-align:center;margin-top:1px}
        @keyframes wv{0%{transform:translateX(0)}100%{transform:translateX(-120px)}}
        .wl{animation:wv 4s linear infinite}
        .warn-abs{position:absolute;top:10px;left:10px;font-size:20px;animation:wb .9s infinite}
        @keyframes wb{0%,100%{opacity:1}50%{opacity:.5}}
        ${pumpOn?'@keyframes pp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.1)}}.pump-icon{animation:pp .8s infinite}':''}
        .pump-icon{cursor:pointer}
        /* Info column */
        .info-col{padding:${infoPad};${infoBorderCss};display:flex;flex-direction:column;gap:0}
        /* Toggles */
        .toggles-panel{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--divider-color,rgba(255,255,255,.08))}
        .toggle-row{display:flex;align-items:center;gap:8px}
        .tog-icon{width:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .tog-label{flex:1;font-size:13px;color:var(--primary-text-color,#fff)}
        .tog-btn{border:none;border-radius:12px;padding:3px 10px;font-size:11px;font-weight:700;cursor:pointer;min-width:42px;transition:background .2s}
        .tog-btn.on{background:#43a047;color:#fff}
        .tog-btn:not(.on){background:rgba(255,255,255,.12);color:var(--secondary-text-color,rgba(255,255,255,.5))}
        /* Stats */
        .stats-panel{display:flex;flex-direction:column;gap:6px}
        .stat-row{display:flex;align-items:center;gap:8px;font-size:13px}
        .stat-icon{width:22px;text-align:center;font-size:14px;flex-shrink:0}
        .stat-label{flex:1;color:var(--secondary-text-color,rgba(255,255,255,.6));font-size:12px}
        .stat-val{font-weight:600;color:var(--primary-text-color,#fff);text-align:right;white-space:nowrap}
        .stat-val small{font-weight:400;font-size:11px;color:var(--secondary-text-color,rgba(255,255,255,.5));margin-left:2px}
      </style>
      <ha-card>
        <div class="card-wrap">
          ${isLow?'<div class="warn-abs">⚠️</div>':''}

          <!-- LEFT: tank -->
          <div class="tank-col">
            <div class="tank-title">${title}</div>
            <svg class="tank-svg" viewBox="0 0 300 370" xmlns="http://www.w3.org/2000/svg">
              ${svgDefs}${svgBody}
              ${pe?`<g class="pump-icon" id="pumpIcon" transform="translate(${150-15},${pumpY-15}) scale(1.25)" style="filter:${pumpGlow}">${pumpPath}</g>`:''}
              <text x="150" y="230" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
            </svg>
            ${litresText?`<div class="litres-row">${litresText}</div>`:''}
            ${isLow?`<div class="warn-bar">⚠️ Below ${warnBelow}% — ${litresText||p+'%'} left</div>`:''}
            ${runtimeText?`<div class="pump-runtime">⚡ ${runtimeText}</div>`:''}
            <div class="last-updated">${updatedText}</div>
            ${sparkline?`<div class="sparkline-wrap">${sparkline}<div class="sparkline-label">24h history</div></div>`:''}
          </div>

          <!-- RIGHT: toggles + stats -->
          <div class="info-col">
            ${togglesPanel}
            ${statsPanel}
          </div>
        </div>
      </ha-card>`;

    // Tank column tap/hold
    const tankCol = this.shadowRoot.querySelector('.tank-col');
    if (tankCol && !tankCol._bound) {
      tankCol._bound = true;
      tankCol.addEventListener('pointerdown', () => { this._isHold=false; this._holdTimer=setTimeout(()=>{this._isHold=true;this._handleHold();},500); });
      tankCol.addEventListener('pointerup', () => { clearTimeout(this._holdTimer); if (!this._isHold) this._handleTap(); });
      tankCol.addEventListener('pointerleave', () => clearTimeout(this._holdTimer));
    }
    const pi = this.shadowRoot.querySelector('#pumpIcon');
    if (pi) pi.addEventListener('click', e => { e.stopPropagation(); this._togglePump(); });

    // Toggle buttons
    this.shadowRoot.querySelectorAll('.tog-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const eid = btn.dataset.entity;
        if (eid) this._hass.callService('switch', 'toggle', { entity_id: eid });
      });
    });
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type:'water-tank-card', name:'Water Tank Card', description:'Animated SVG water tank — compact & full modes', preview:true, documentationURL:'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v'+CARD_VERSION,'color:#fff;background:#1565c0;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;','color:#1565c0;background:#e3f2fd;padding:2px 6px;border-radius:0 3px 3px 0;');
