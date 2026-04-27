const CARD_VERSION = '2.0.0';

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
    return { entity_level: '', title: 'Jojo' };
  }

  setConfig(config) {
    if (!config.entity_level) throw new Error('Please define entity_level');
    this._config = config;
  }

  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return 2; }

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

    // Pump
    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump && pump.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.3)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 4px rgba(239,68,68,0.8))' : 'none';

    // Tank geometry (same SVG tank from v1.8, viewBox 0 0 300 380)
    const L = 70, R = 230, domeY = 60, topY = 80, botY = 340, cornerR = 15;
    const fillY = botY - (pct / 100) * (botY - topY);

    const tankPath = `M ${L},${topY} Q ${L},${domeY-5} 150,${domeY-10} Q ${R},${domeY-5} ${R},${topY} L ${R},${botY-cornerR} Q ${R},${botY} ${R-cornerR},${botY} L ${L+cornerR},${botY} Q ${L},${botY} ${L},${botY-cornerR} Z`;

    const ribCount = 7, ribSp = (botY - topY) / (ribCount + 1);
    let ribs = '';
    for (let i = 1; i <= ribCount; i++) {
      const ry = topY + i * ribSp;
      ribs += `<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>`;
    }

    const pumpY = Math.max(domeY + 15, fillY - 30);

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
          overflow: hidden;
          padding: 0;
        }
        .card-touch {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
        }
        .tank-svg {
          display: block;
          width: auto;
          height: 78px;
          margin-top: 2px;
        }
        @keyframes wv { 0% { transform: translateX(0); } 100% { transform: translateX(-120px); } }
        .wl { animation: wv 4s linear infinite; }
        ${pumpOn ? `.pump-icon { animation: pp 0.8s infinite; } @keyframes pp { 0%,100%{opacity:1}50%{opacity:0.4} }` : ''}
        .tank-label {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          line-height: 1;
          margin-top: 1px;
        }
      </style>
      <ha-card>
        <div class="card-touch">
          <svg class="tank-svg" viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
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
              <filter id="ts"><feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="rgba(0,0,0,0.7)"/></filter>
            </defs>
            <g clip-path="url(#tc)">
              <rect x="${L}" y="${fillY}" width="${R-L}" height="${botY-fillY}" fill="url(#fg)" opacity="0.9"/>
              ${pct > 2 ? `<g class="wl"><path d="M ${L-10},${fillY} q 15,-7 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 L ${R+10},${fillY+12} L ${L-10},${fillY+12} Z" fill="rgba(255,255,255,0.15)"/></g>` : ''}
            </g>
            <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>
            ${ribs}
            <path d="M 130,${domeY-10} L 130,${domeY-22} Q 130,${domeY-26} 134,${domeY-26} L 166,${domeY-26} Q 170,${domeY-26} 170,${domeY-22} L 170,${domeY-10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
            <rect x="140" y="${domeY-32}" width="20" height="7" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
            ${pe ? `<g class="pump-icon" transform="translate(${150-15}, ${pumpY-15}) scale(1.25)" style="filter:${pumpGlow}">
              <path d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" fill="${pumpColor}"/>
            </g>` : ''}
            <text x="150" y="230" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
          </svg>
          <div class="tank-label">${title}</div>
        </div>
      </ha-card>`;
    this._bindEvents();
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'SVG water tank with pump control', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;');
