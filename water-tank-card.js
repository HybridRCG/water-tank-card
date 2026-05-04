const CARD_VERSION = '3.5.0';

// ══════════════════════════════════════════════════════════
//  EDITOR  — renders once, updates values in-place on change
//  Never rebuilds the DOM on hass updates (no slowdown)
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
    if (!this._rendered) {
      this._rendered = true;
      this._render();
    } else {
      // Push hass to existing pickers only — zero DOM rebuild
      this.shadowRoot.querySelectorAll('ha-entity-picker[data-picker]').forEach(p => { p.hass = hass; });
    }
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) {
      this._updateValues();
    }
    // If not rendered yet, _render() triggered by hass setter will pick up _config
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config }, bubbles: true, composed: true
    }));
  }

  _entityPicker(field, current) {
    // ha-entity-picker is HA's native lazy searchable picker — no entity list in DOM
    return `<ha-entity-picker data-field="${field}" data-picker="true" allow-custom-entity></ha-entity-picker>`;
  }

  // Update existing input/select values without touching the DOM structure
  _updateValues() {
    const c = this._config;
    const set = (field, val) => {
      const el = this.shadowRoot.querySelector(`[data-field="${field}"]`);
      if (el && document.activeElement !== el) el.value = val || '';
    };
    set('entity_level', c.entity_level);
    set('title', c.title);
    set('mode', c.mode || 'compact');
    set('tank_capacity', c.tank_capacity || '');
    set('tank_color', c.tank_color || c.fill_color || '#1a78c2');
    set('pump_entity', c.pump_entity);
    set('pump_confirmation', c.pump_confirmation);
    set('history_entity', c.history_entity);
    set('navigate_to', c.navigate_to);
    set('tap_action', c.tap_action || 'pump');
  }

  _render() {
    const c = this._config;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .editor { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
        label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--primary-text-color); }
        input, select {
          padding: 6px 8px; border-radius: 6px;
          border: 1px solid var(--divider-color, #ccc);
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          font-size: 13px; width: 100%; box-sizing: border-box;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .section {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--secondary-text-color);
          margin-top: 4px; border-bottom: 1px solid var(--divider-color, #eee);
          padding-bottom: 3px;
        }
        input[type=color] { height: 34px; padding: 2px 4px; cursor: pointer; }
        .hint { font-size: 11px; color: var(--secondary-text-color); margin-top: -6px; }
      </style>
      <div class="editor">

        <div class="section">Required</div>
        <label>Tank Level Entity (%)
          ${this._entityPicker('entity_level', c.entity_level)}
        </label>

        <div class="section">Display</div>
        <div class="row">
          <label>Title
            <input type="text" data-field="title" value="${c.title || ''}">
          </label>
          <label>Mode
            <select data-field="mode">
              <option value="compact"${(c.mode || 'compact') === 'compact' ? ' selected' : ''}>Compact</option>
              <option value="full"${c.mode === 'full' ? ' selected' : ''}>Full</option>
            </select>
          </label>
        </div>

        <div class="section">Capacity</div>
        <label>Tank Capacity (litres)
          <input type="number" data-field="tank_capacity" value="${c.tank_capacity || ''}" placeholder="e.g. 5000">
        </label>
        <p class="hint">Shows calculated litres beneath %. Leave blank to hide.</p>

        <div class="section">Fill Colour</div>
        <label>Custom colour (removes red→green gradient)
          <input type="color" data-field="tank_color" value="${c.tank_color || c.fill_color || '#1a78c2'}">
        </label>
        <p class="hint">Delete tank_color from YAML to restore the default gradient.</p>

        <div class="section">Pump</div>
        <label>Pump Entity
          ${this._entityPicker('pump_entity', c.pump_entity)}
        </label>
        <label>Pump Confirmation Message
          <input type="text" data-field="pump_confirmation"
            value="${c.pump_confirmation || ''}"
            placeholder="Are you sure you want to Toggle the Borehole Pump?">
        </label>

        <div class="section">Tap Action</div>
        <label>What happens when you tap the card
          <select data-field="tap_action">
            <option value="pump"${(!c.tap_action || c.tap_action === 'pump') ? ' selected' : ''}>Toggle pump</option>
            <option value="more-info"${c.tap_action === 'more-info' ? ' selected' : ''}>More info (level entity)</option>
            <option value="none"${c.tap_action === 'none' ? ' selected' : ''}>None</option>
          </select>
        </label>

        <div class="section">Navigation</div>
        <label>Hold to Navigate (Lovelace path)
          <input type="text" data-field="navigate_to"
            value="${c.navigate_to || ''}" placeholder="/lovelace/tanks">
        </label>

        <div class="section">History Sparkline (Full mode)</div>
        <label>History Entity (defaults to level entity)
          ${this._entityPicker('history_entity', c.history_entity)}
        </label>

      </div>`;

    // Wire plain inputs/selects
    this.shadowRoot.querySelectorAll('[data-field]:not([data-picker])').forEach(el => {
      const ev = el.type === 'color' ? 'input' : 'change';
      el.addEventListener(ev, (e) => {
        const field = e.target.dataset.field;
        const val = e.target.value;
        if (val === '') {
          const c2 = { ...this._config }; delete c2[field]; this._config = c2;
        } else {
          this._config = { ...this._config, [field]: field === 'tank_capacity' ? parseFloat(val) : val };
        }
        this._dispatch();
      });
    });

    // Wire ha-entity-picker elements — set hass + value, listen for value-changed
    this.shadowRoot.querySelectorAll('ha-entity-picker[data-picker]').forEach(picker => {
      const field = picker.dataset.field;
      if (this._hass) picker.hass = this._hass;
      picker.value = this._config[field] || '';
      picker.addEventListener('value-changed', (e) => {
        const val = e.detail.value;
        if (!val) {
          const c2 = { ...this._config }; delete c2[field]; this._config = c2;
        } else {
          this._config = { ...this._config, [field]: val };
        }
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
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { entity_level: '', title: 'Jojo', mode: 'compact' };
  }

  static getConfigElement() {
    return document.createElement('water-tank-card-editor');
  }

  setConfig(config) {
    if (!config.entity_level) throw new Error('Please define entity_level');
    this._config = config;
    // Config changed — force a fresh render
    this._lastPct = null;
    this._lastPumpOn = null;
    this._lastMode = null;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;

    // Dirty check — skip full re-render if nothing visible changed
    const level = hass.states[this._config.entity_level];
    const pctRaw = level && level.state !== 'unknown' && level.state !== 'unavailable'
      ? Math.round(parseFloat(String(level.state).match(/[\d.]+/)?.[0]) || 0)
      : 0;
    const pe = this._config.pump_entity;
    const pumpOn = pe ? (hass.states[pe] && hass.states[pe].state === 'on') : false;
    const mode = this._config.mode || 'compact';

    if (pctRaw === this._lastPct && pumpOn === this._lastPumpOn && mode === this._lastMode) return;

    this._lastPct = pctRaw;
    this._lastPumpOn = pumpOn;
    this._lastMode = mode;
    this._render();

    // History: fetch once per minute in full mode
    if (mode === 'full') {
      const now = Date.now();
      if (!this._lastHistoryFetch || now - this._lastHistoryFetch > 60000) {
        this._lastHistoryFetch = now;
        this._fetchHistory();
      }
    }
  }

  getCardSize() { return this._config && this._config.mode === 'full' ? 5 : 2; }

  getGridOptions() {
    const mode = this._config ? this._config.mode : 'compact';
    if (mode === 'full') return { columns: 6, rows: 5, min_columns: 3, min_rows: 3, max_columns: 12, max_rows: 12 };
    return { columns: 3, rows: 2, min_columns: 2, min_rows: 2, max_columns: 6, max_rows: 4 };
  }

  async _fetchHistory() {
    if (!this._hass || !this._config) return;
    const entityId = this._config.history_entity || this._config.entity_level;
    const end = new Date();
    const start = new Date(end - 24 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString();
    try {
      const res = await this._hass.callApi('GET',
        `history/period/${fmt(start)}?filter_entity_id=${entityId}&end_time=${fmt(end)}&minimal_response=true&no_attributes=true`
      );
      if (res && res[0] && res[0].length > 1) {
        this._history = res[0]
          .filter(s => s.state !== 'unknown' && s.state !== 'unavailable')
          .map(s => ({ t: new Date(s.last_changed).getTime(), v: parseFloat(s.state) }))
          .filter(s => !isNaN(s.v));
        this._render();
      }
    } catch (_) { /* history unavailable — silently skip */ }
  }

  _sparklineSvg(history, width = 260, height = 36) {
    if (!history || history.length < 2) return '';
    const vals = history.map(h => h.v);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const minT = history[0].t, maxT = history[history.length - 1].t;
    const tRange = maxT - minT || 1;
    const px = (t) => ((t - minT) / tRange) * width;
    const py = (v) => height - 4 - ((v - minV) / range) * (height - 8);
    const pts = history.map(h => `${px(h.t).toFixed(1)},${py(h.v).toFixed(1)}`).join(' ');
    const areaClose = ` ${width},${height} 0,${height}`;
    return `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:${height}px;display:block;opacity:0.7;margin-top:4px">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#42a5f5" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#42a5f5" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="${pts} ${areaClose}" fill="url(#sg)"/>
        <polyline points="${pts}" fill="none" stroke="#42a5f5" stroke-width="1.5"
                  stroke-linejoin="round" stroke-linecap="round"/>
      </svg>`;
  }

  _fireMoreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info',
      { bubbles: true, composed: true, detail: { entityId } }));
  }

  _fillStyle(pct, customColor) {
    if (customColor) return { fill: customColor, glow: customColor };
    return { fill: 'url(#fg)', glow: pct > 60 ? '#43a047' : pct > 30 ? '#fbc02d' : '#e53935' };
  }

  _litresText(pct, config, hass) {
    if (config.entity_liters) {
      const lit = hass.states[config.entity_liters];
      if (lit && lit.state !== 'unknown' && lit.state !== 'unavailable') {
        const m = String(lit.state).match(/[\d.]+/);
        if (m) {
          const u = (lit.attributes && lit.attributes.unit_of_measurement) || 'L';
          return `${Math.round(parseFloat(m[0]))} ${u}`;
        }
      }
    }
    if (config.tank_capacity) {
      const litres = Math.round((pct / 100) * parseFloat(config.tank_capacity));
      return `${litres.toLocaleString()} L`;
    }
    return '';
  }

  _handleTap() {
    if (!this._hass || !this._config) return;
    const action = this._config.tap_action || (this._config.pump_entity ? 'pump' : 'none');
    if (action === 'more-info') { this._fireMoreInfo(this._config.entity_level); return; }
    if (action === 'pump' && this._config.pump_entity) {
      const msg = this._config.pump_confirmation || 'Are you sure you want to Toggle the Borehole Pump?';
      if (confirm(msg)) this._hass.callService('switch', 'toggle', { entity_id: this._config.pump_entity });
    }
  }

  _handleHold() {
    if (!this._config) return;
    const nav = this._config.navigate_to || '';
    if (nav) { window.history.pushState(null, '', nav); window.dispatchEvent(new Event('location-changed')); }
  }

  _bindEvents() {
    const el = this.shadowRoot.querySelector('.card-touch');
    if (!el || el._bound) return;
    el._bound = true;
    el.addEventListener('pointerdown', () => {
      this._isHold = false;
      this._holdTimer = setTimeout(() => { this._isHold = true; this._handleHold(); }, 500);
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

    if (!level) {
      this.shadowRoot.innerHTML = `<ha-card><div style="color:var(--error-color,#db4437);padding:8px;font-size:12px"><b>Not found:</b> ${c.entity_level}</div></ha-card>`;
      return;
    }

    let pct = 0;
    if (level.state !== 'unknown' && level.state !== 'unavailable') {
      const m = String(level.state).match(/[\d.]+/);
      if (m) pct = Math.min(100, Math.max(0, parseFloat(m[0]) || 0));
    }
    const p = Math.round(pct);

    const customColor = c.tank_color || c.fill_color || null;
    const { fill, glow } = this._fillStyle(p, customColor);
    const litresText = this._litresText(p, c, this._hass);

    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump && pump.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : 'none';

    const L = 60, R = 240, domeY = 50, topY = 72, botY = 330, cR = 14;
    const fillY = botY - (pct / 100) * (botY - topY);
    const tankPath = `M ${L},${topY} Q ${L},${domeY-5} 150,${domeY-10} Q ${R},${domeY-5} ${R},${topY} L ${R},${botY-cR} Q ${R},${botY} ${R-cR},${botY} L ${L+cR},${botY} Q ${L},${botY} ${L},${botY-cR} Z`;
    const ribCount = 6, ribSp = (botY - topY) / (ribCount + 1);
    let ribs = '';
    for (let i = 1; i <= ribCount; i++) {
      const ry = topY + i * ribSp;
      ribs += `<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>`;
    }
    const pumpY = Math.max(domeY + 15, fillY - 30);
    const pumpSvg = `<path d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" fill="${pumpColor}"/>`;
    const lidY = domeY;
    const lid = `
      <path d="M 130,${lidY-10} L 130,${lidY-22} Q 130,${lidY-26} 134,${lidY-26} L 166,${lidY-26} Q 170,${lidY-26} 170,${lidY-22} L 170,${lidY-10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
      <rect x="141" y="${lidY-31}" width="18" height="6" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.3"/>`;

    const glowColor = glow.startsWith('#') ? glow : '#43a047';
    const glowFilter = `<filter id="wg" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="${glowColor}" flood-opacity="0.4" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;

    const tankSvgInner = `
      <defs>
        <linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stop-color="#d32f2f"/>
          <stop offset="15%"  stop-color="#e53935"/>
          <stop offset="30%"  stop-color="#f57c00"/>
          <stop offset="50%"  stop-color="#fbc02d"/>
          <stop offset="70%"  stop-color="#cddc39"/>
          <stop offset="85%"  stop-color="#66bb6a"/>
          <stop offset="100%" stop-color="#43a047"/>
        </linearGradient>
        <clipPath id="tc"><path d="${tankPath}"/></clipPath>
        <filter id="ts"><feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="rgba(0,0,0,0.75)"/></filter>
        ${glowFilter}
      </defs>
      <g clip-path="url(#tc)">
        <rect x="${L}" y="${fillY}" width="${R-L}" height="${botY-fillY}" fill="${fill}" opacity="0.92" filter="url(#wg)"/>
        ${pct > 2 ? `<g class="wl"><path d="M ${L-10},${fillY} q 12,-6 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 L ${R+10},${fillY+10} L ${L-10},${fillY+10} Z" fill="rgba(255,255,255,0.13)"/></g>` : ''}
      </g>
      <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5"/>
      ${ribs}
      ${lid}`;

    // ════════ COMPACT ════════
    if (mode === 'compact') {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          ha-card {
            height: 110px; border-radius: 18px !important;
            background: var(--card-background-color, rgba(30,30,30,0.35)) !important;
            backdrop-filter: blur(10px);
            border: 1px solid var(--divider-color, rgba(255,255,255,0.08)) !important;
            box-shadow: none !important; overflow: visible; padding: 0; position: relative;
          }
          .card-touch {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; align-items: center; width: 100%; height: 100%;
            cursor: pointer; user-select: none; -webkit-user-select: none;
            touch-action: manipulation; gap: 2px; padding-bottom: 12px;
          }
          .tank-svg { display: block; height: 68px; width: auto; }
          @keyframes wv { 0%{transform:translateX(0)} 100%{transform:translateX(-100px)} }
          .wl { animation: wv 4s linear infinite; }
          .tank-label { font-size: 17px; font-weight: 600; color: ${p < 50 ? 'var(--error-color, #ef4444)' : 'var(--primary-text-color, rgba(255,255,255,0.9))'}; line-height:1; }
          .litres-label { font-size: 11px; color: var(--secondary-text-color, rgba(255,255,255,0.55)); line-height:1; }
          .pump-badge { position:absolute; top:6px; right:8px; width:20px; height:20px; z-index:10; }
          .pump-badge svg { width:100%; height:100%; }
          ${pumpOn ? `.pump-badge { animation: pp 0.8s infinite; } @keyframes pp { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.15)} }` : ''}
        </style>
        <ha-card>
          ${pe ? `<div class="pump-badge"><svg viewBox="0 0 24 24">${pumpSvg}</svg></div>` : ''}
          <div class="card-touch">
            <svg class="tank-svg" viewBox="20 10 260 340" xmlns="http://www.w3.org/2000/svg">
              ${tankSvgInner}
            </svg>
            <div class="tank-label">${title} — ${p}%</div>
          </div>
        </ha-card>`;
      this._bindEvents();
      return;
    }

    // ════════ FULL ════════
    const sparkline = this._sparklineSvg(this._history);
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          overflow: hidden;
          background: var(--card-background-color, transparent) !important;
          border: 1px solid var(--divider-color, rgba(255,255,255,0.08)) !important;
          box-shadow: var(--ha-card-box-shadow, none) !important;
        }
        .card-wrap { padding: 12px 12px 10px; user-select: none; -webkit-user-select: none; touch-action: manipulation; }
        .tank-title { text-align:center; font-size:15px; font-weight:600; color:var(--primary-text-color,#fff); margin-bottom:4px; }
        .tank-svg { display:block; width:100%; max-width:300px; margin:0 auto; }
        .litres-row { text-align:center; margin-top:4px; font-size:14px; color:var(--secondary-text-color,rgba(255,255,255,0.6)); }
        .sparkline-wrap { padding: 0 8px 4px; }
        .sparkline-label { font-size:10px; color:var(--secondary-text-color,rgba(255,255,255,0.4)); text-align:center; margin-top:2px; }
        @keyframes wv { 0%{transform:translateX(0)} 100%{transform:translateX(-120px)} }
        .wl { animation: wv 4s linear infinite; }
        ${pumpOn ? `.pump-icon { animation: pp 0.8s infinite; } @keyframes pp { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.1)} }` : ''}
        .pump-icon { cursor: pointer; }
      </style>
      <ha-card>
        <div class="card-wrap">
          <div class="tank-title">${title}</div>
          <svg class="tank-svg" viewBox="0 0 300 370" xmlns="http://www.w3.org/2000/svg">
            ${tankSvgInner}
            ${pe ? `<g class="pump-icon" id="pumpIcon" transform="translate(${150-15},${pumpY-15}) scale(1.25)" style="filter:${pumpGlow}">${pumpSvg}</g>` : ''}
            <text x="150" y="230" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
          </svg>
          ${litresText ? `<div class="litres-row">${litresText}</div>` : ''}
          ${sparkline ? `<div class="sparkline-wrap">${sparkline}<div class="sparkline-label">24h history</div></div>` : ''}
        </div>
      </ha-card>`;

    const wrap = this.shadowRoot.querySelector('.card-wrap');
    if (wrap && !wrap._bound) {
      wrap._bound = true;
      wrap.addEventListener('pointerdown', () => {
        this._isHold = false;
        this._holdTimer = setTimeout(() => { this._isHold = true; this._handleHold(); }, 500);
      });
      wrap.addEventListener('pointerup', () => { clearTimeout(this._holdTimer); });
      wrap.addEventListener('pointerleave', () => clearTimeout(this._holdTimer));
    }
    const pumpIcon = this.shadowRoot.querySelector('#pumpIcon');
    if (pumpIcon) {
      pumpIcon.addEventListener('click', (e) => { e.stopPropagation(); this._handleTap(); });
    }
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'water-tank-card',
  name: 'Water Tank Card',
  description: 'Animated SVG water tank — compact & full modes',
  preview: true,
  documentationURL: 'https://github.com/HybridRCG/water-tank-card'
});
console.info(
  '%c WATER-TANK-CARD %c v' + CARD_VERSION,
  'color:#fff;background:#1565c0;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;',
  'color:#1565c0;background:#e3f2fd;padding:2px 6px;border-radius:0 3px 3px 0;'
);
