const CARD_VERSION = '2.7.0';

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

  // ── Phase 2: resolve fill colour + glow ─────────────────
  _fillStyle(pct, customColor) {
    if (customColor) {
      return { fill: customColor, glow: customColor };
    }
    // Default: red→green gradient id referenced in SVG
    return { fill: 'url(#fg)', glow: pct > 60 ? '#43a047' : pct > 30 ? '#fbc02d' : '#e53935' };
  }

  // ── Phase 2: calculate litres from capacity ──────────────
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

    // Phase 2: custom colour / theme glow
    const customColor = c.tank_color || c.fill_color || null;
    const { fill, glow } = this._fillStyle(p, customColor);
    const glowRgba = glow.startsWith('#')
      ? glow + (glow.length === 7 ? 'aa' : '')
      : 'rgba(67,160,71,0.5)';
    const litresText = this._litresText(p, c, this._hass);

    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump && pump.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : 'none';

    // Shared SVG geometry
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

    // Phase 2: glow filter on fill rect
    const glowFilter = `<filter id="wg" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="${glow.startsWith('#') ? glow : '#43a047'}" flood-opacity="0.45" result="color"/>
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

    // ══════════════════ COMPACT MODE ══════════════════════
    if (mode === 'compact') {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          ha-card {
            height: 110px;
            border-radius: 18px !important;
            background: var(--card-background-color, rgba(30,30,30,0.35)) !important;
            backdrop-filter: blur(10px);
            border: 1px solid var(--divider-color, rgba(255,255,255,0.08)) !important;
            box-shadow: none !important;
            overflow: visible;
            padding: 0;
            position: relative;
          }
          .card-touch {
            display: flex; flex-direction: column; align-items: center;
            justify-content: flex-start; width: 100%; height: 100%;
            cursor: pointer; user-select: none; -webkit-user-select: none;
            touch-action: manipulation; gap: 2px; padding-top: 5px;
          }
          .tank-svg { display: block; height: 68px; width: auto; }
          @keyframes wv { 0%{transform:translateX(0)} 100%{transform:translateX(-100px)} }
          .wl { animation: wv 4s linear infinite; }
          .tank-label { font-size: 17px; font-weight: 600; color: var(--primary-text-color, rgba(255,255,255,0.9)); line-height:1; }
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
              <text x="150" y="210" text-anchor="middle" dominant-baseline="central" font-size="48" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
            </svg>
            <div class="tank-label">${title}</div>
            ${litresText ? `<div class="litres-label">${litresText}</div>` : ''}
          </div>
        </ha-card>`;
      this._bindEvents();
      return;
    }

    // ══════════════════ FULL MODE ══════════════════════════
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          overflow: hidden;
          background: var(--card-background-color, transparent) !important;
          border: 1px solid var(--divider-color, rgba(255,255,255,0.08)) !important;
          box-shadow: var(--ha-card-box-shadow, none) !important;
        }
        .card-wrap {
          padding: 12px 12px 10px;
          user-select: none; -webkit-user-select: none;
          touch-action: manipulation;
        }
        .tank-title {
          text-align: center;
          font-size: 15px; font-weight: 600;
          color: var(--primary-text-color, #fff);
          margin-bottom: 4px;
        }
        .tank-svg { display: block; width: 100%; max-width: 300px; margin: 0 auto; }
        .litres-row {
          text-align: center; margin-top: 4px;
          font-size: 14px; color: var(--secondary-text-color, rgba(255,255,255,0.6));
        }
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
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'Animated SVG water tank — compact & full modes', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#1565c0;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#1565c0;background:#e3f2fd;padding:2px 6px;border-radius:0 3px 3px 0;');
