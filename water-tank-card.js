const CARD_VERSION = '2.4.0';

class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._config = null;
    this._holdTimer = null;
    this._isHold = false;
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { entity_level: '', title: 'Jojo', mode: 'compact' };
  }

  setConfig(config) {
    if (!config.entity_level) throw new Error('Please define entity_level');
    this._config = config;
  }

  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return this._config && this._config.mode === 'full' ? 5 : 2; }

  getGridOptions() {
    const mode = this._config ? this._config.mode : 'compact';
    if (mode === 'full') {
      return { columns: 6, rows: 5, min_columns: 3, min_rows: 3, max_columns: 12, max_rows: 12 };
    }
    return { columns: 3, rows: 2, min_columns: 2, min_rows: 2, max_columns: 6, max_rows: 4 };
  }

  _handleTap() {
    if (!this._hass || !this._config) return;
    const pe = this._config.pump_entity;
    if (!pe) return;
    const msg = this._config.pump_confirmation || 'Are you sure you want to Toggle the Borehole Pump?';
    if (confirm(msg)) {
      this._hass.callService('switch', 'toggle', { entity_id: pe });
    }
  }

  _handleHold() {
    if (!this._config) return;
    const nav = this._config.navigate_to || '';
    if (nav) {
      window.history.pushState(null, '', nav);
      window.dispatchEvent(new Event('location-changed'));
    }
  }

  _bindEvents() {
    const el = this.shadowRoot.querySelector('.card-touch');
    if (!el || el._bound) return;
    el._bound = true;
    el.addEventListener('pointerdown', () => {
      this._isHold = false;
      this._holdTimer = setTimeout(() => { this._isHold = true; this._handleHold(); }, 500);
    });
    el.addEventListener('pointerup', () => {
      clearTimeout(this._holdTimer);
      if (!this._isHold) this._handleTap();
    });
    el.addEventListener('pointerleave', () => clearTimeout(this._holdTimer));
  }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const c = this._config;
    const mode = c.mode || 'compact';
    const level = this._hass.states[c.entity_level];
    const title = c.title || 'Jojo';

    if (!level) {
      this.shadowRoot.innerHTML = `<ha-card><div style="color:#db4437;padding:8px;font-size:12px"><b>Not found:</b> ${c.entity_level}</div></ha-card>`;
      return;
    }

    let pct = 0;
    if (level.state !== 'unknown' && level.state !== 'unavailable') {
      const m = String(level.state).match(/[\d.]+/);
      if (m) pct = Math.min(100, Math.max(0, parseFloat(m[0]) || 0));
    }
    const p = Math.round(pct);

    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump && pump.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : 'none';

    // Liters (for full mode)
    let litersText = '';
    if (c.entity_liters) {
      const lit = this._hass.states[c.entity_liters];
      if (lit && lit.state !== 'unknown' && lit.state !== 'unavailable') {
        const m2 = String(lit.state).match(/[\d.]+/);
        if (m2) {
          litersText = m2[0];
          const u = lit.attributes && lit.attributes.unit_of_measurement;
          if (u) litersText += ' ' + u;
        }
      }
    }

    // Shared SVG tank geometry
    const L = 60, R = 240, domeY = 50, topY = 72, botY = 330, cR = 14;
    const fillY = botY - (pct / 100) * (botY - topY);
    const tankPath = `M ${L},${topY} Q ${L},${domeY-5} 150,${domeY-10} Q ${R},${domeY-5} ${R},${topY} L ${R},${botY-cR} Q ${R},${botY} ${R-cR},${botY} L ${L+cR},${botY} Q ${L},${botY} ${L},${botY-cR} Z`;
    const ribCount = 6, ribSp = (botY - topY) / (ribCount + 1);
    let ribs = '';
    for (let i = 1; i <= ribCount; i++) {
      const ry = topY + i * ribSp;
      ribs += `<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`;
    }
    const pumpY = Math.max(domeY + 15, fillY - 30);
    const pumpSvg = `<path d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" fill="${pumpColor}"/>`;

    const lidY = domeY;
    const lid = `<path d="M 130,${lidY-10} L 130,${lidY-22} Q 130,${lidY-26} 134,${lidY-26} L 166,${lidY-26} Q 170,${lidY-26} 170,${lidY-22} L 170,${lidY-10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
      <rect x="141" y="${lidY-31}" width="18" height="6" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.3"/>`;

    const tankSvgInner = `
      <defs>
        <linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#d32f2f"/>
          <stop offset="15%" stop-color="#e53935"/>
          <stop offset="30%" stop-color="#f57c00"/>
          <stop offset="50%" stop-color="#fbc02d"/>
          <stop offset="70%" stop-color="#cddc39"/>
          <stop offset="85%" stop-color="#66bb6a"/>
          <stop offset="100%" stop-color="#43a047"/>
        </linearGradient>
        <clipPath id="tc"><path d="${tankPath}"/></clipPath>
        <filter id="ts"><feDropShadow dx="0" dy="1" stdDeviation="${mode === 'full' ? 3 : 2}" flood-color="rgba(0,0,0,0.7)"/></filter>
      </defs>
      <g clip-path="url(#tc)">
        <rect x="${L}" y="${fillY}" width="${R-L}" height="${botY-fillY}" fill="url(#fg)" opacity="0.9"/>
        ${pct > 2 ? `<g class="wl"><path d="M ${L-10},${fillY} q 12,-6 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 t 24,0 L ${R+10},${fillY+10} L ${L-10},${fillY+10} Z" fill="rgba(255,255,255,0.15)"/></g>` : ''}
      </g>
      <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2.5"/>
      ${ribs}
      ${lid}`;

    // ===================== COMPACT MODE =====================
    if (mode === 'compact') {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          ha-card {
            height: 110px;
            border-radius: 18px !important;
            background: rgba(30,30,30,0.35) !important;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.08) !important;
            box-shadow: none !important;
            overflow: visible;
            padding: 0;
            position: relative;
          }
          .card-touch {
            display: flex; flex-direction: column; align-items: center;
            justify-content: flex-start; width: 100%; height: 100%;
            cursor: pointer; user-select: none; -webkit-user-select: none;
            touch-action: manipulation; gap: 4px; padding-top: 6px;
          }
          .tank-svg { display: block; height: 72px; width: auto; }
          @keyframes wv { 0%{transform:translateX(0)} 100%{transform:translateX(-100px)} }
          .wl { animation: wv 4s linear infinite; }
          .tank-label { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.9); line-height:1; margin-top:-2px; }
          .pump-badge { position:absolute; top:6px; right:8px; width:22px; height:22px; z-index:10; }
          .pump-badge svg { width:100%; height:100%; }
          ${pumpOn ? `.pump-badge { animation: pp 0.8s infinite; } @keyframes pp { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.15)} }` : ''}
        </style>
        <ha-card>
          ${pe ? `<div class="pump-badge"><svg viewBox="0 0 24 24">${pumpSvg}</svg></div>` : ''}
          <div class="card-touch">
            <svg class="tank-svg" viewBox="20 10 260 340" xmlns="http://www.w3.org/2000/svg">
              ${tankSvgInner}
              <text x="150" y="210" text-anchor="middle" dominant-baseline="central" font-size="48" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
            </svg>
            <div class="tank-label">${title}</div>
          </div>
        </ha-card>`;
      this._bindEvents();
      return;
    }

    // ===================== FULL MODE =====================
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          overflow: hidden;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .card-wrap {
          padding: 12px 12px 8px;
          cursor: pointer; user-select: none; -webkit-user-select: none;
          touch-action: manipulation;
        }
        .tank-svg { display: block; width: 100%; max-width: 320px; margin: 0 auto; }
        @keyframes wv { 0%{transform:translateX(0)} 100%{transform:translateX(-120px)} }
        .wl { animation: wv 4s linear infinite; }
        ${pumpOn ? `.pump-icon { animation: pp 0.8s infinite; } @keyframes pp { 0%,100%{opacity:1}50%{opacity:0.4} }` : ''}
        .stats-bar { display: flex; margin: 10px 0 0; gap: 8px; }
        .stat-box {
          flex: 1; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 8px; text-align: center;
        }
        .stat-label {
          font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
          color: var(--secondary-text-color, #888); text-transform: uppercase;
        }
        .stat-val {
          font-size: 22px; font-weight: 700; margin-top: 2px;
          color: var(--primary-text-color, #fff);
        }
        .pump-status {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 8px; padding: 8px 12px;
          background: ${pumpOn ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)'};
          border: 1px solid ${pumpOn ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'};
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .pump-status:hover { background: ${pumpOn ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}; }
        .pump-label { font-size: 13px; font-weight: 600; color: ${pumpOn ? '#ef4444' : 'rgba(255,255,255,0.5)'}; }
        .pump-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${pumpOn ? '#ef4444' : 'rgba(255,255,255,0.2)'};
          ${pumpOn ? 'animation: dotPulse 1s infinite;' : ''}
        }
        @keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      </style>

      <ha-card>
        <div class="card-wrap">
          <svg class="tank-svg" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
            ${tankSvgInner}
            ${pe ? `<g class="pump-icon" transform="translate(${150-15}, ${pumpY-15}) scale(1.25)" style="filter:${pumpGlow}">${pumpSvg}</g>` : ''}
            <text x="150" y="235" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
          </svg>

          <div class="stats-bar">
            <div class="stat-box">
              <div class="stat-label">Level</div>
              <div class="stat-val">${p}%</div>
            </div>
            ${litersText ? `<div class="stat-box">
              <div class="stat-label">Remaining</div>
              <div class="stat-val">${litersText}</div>
            </div>` : ''}
          </div>

          ${pe ? `<div class="pump-status" id="pumpBtn">
            <svg viewBox="0 0 24 24" width="20" height="20">${pumpSvg}</svg>
            <div class="pump-dot"></div>
            <div class="pump-label">Pump ${pumpOn ? 'ON' : 'OFF'}</div>
          </div>` : ''}
        </div>
      </ha-card>`;

    this._bindEvents();
    // Pump button in full mode
    const pumpBtn = this.shadowRoot.querySelector('#pumpBtn');
    if (pumpBtn) {
      pumpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleTap();
      });
    }
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'SVG water tank with compact and full modes', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;');
