const CARD_VERSION = '1.7.0';

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
    return { entity_level: '', entity_liters: '', title: 'Water Tank' };
  }

  setConfig(config) {
    if (!config.entity_level) throw new Error('Please define entity_level');
    this._config = config;
  }

  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return 5; }

  _handleTap() {
    if (!this._hass || !this._config) return;
    const pumpEntity = this._config.pump_entity;
    if (!pumpEntity) return;
    const confirmText = this._config.pump_confirmation || 'Are you sure you want to Toggle the Borehole Pump?';
    if (confirm(confirmText)) {
      this._hass.callService('switch', 'toggle', { entity_id: pumpEntity });
    }
  }

  _handleHold() {
    if (!this._config) return;
    const navPath = this._config.navigate_to || '';
    if (navPath) {
      window.history.pushState(null, '', navPath);
      window.dispatchEvent(new Event('location-changed'));
    }
  }

  _bindEvents() {
    const card = this.shadowRoot.querySelector('.tank-touch');
    if (!card) return;
    card.addEventListener('pointerdown', (e) => {
      this._isHold = false;
      this._holdTimer = setTimeout(() => { this._isHold = true; this._handleHold(); }, 500);
    });
    card.addEventListener('pointerup', (e) => {
      clearTimeout(this._holdTimer);
      if (!this._isHold) this._handleTap();
    });
    card.addEventListener('pointerleave', () => clearTimeout(this._holdTimer));
  }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const c = this._config;
    const level = this._hass.states[c.entity_level];
    const title = c.title || 'Water Tank';

    if (!level) {
      this.shadowRoot.innerHTML = `<ha-card header="${title}"><div style="color:#db4437;padding:16px"><b>Entity not found:</b> ${c.entity_level}</div></ha-card>`;
      return;
    }

    let pct = 0;
    if (level.state !== 'unknown' && level.state !== 'unavailable') {
      const m = String(level.state).match(/[\d.]+/);
      if (m) pct = Math.min(100, Math.max(0, parseFloat(m[0]) || 0));
    }
    const p = Math.round(pct);

    // Pump state
    const pumpEntity = c.pump_entity;
    const pump = pumpEntity ? this._hass.states[pumpEntity] : null;
    const pumpOn = pump && pump.state === 'on';

    // Tank geometry
    const L = 70, R = 230, domeY = 60, topY = 80, botY = 340, cornerR = 15;
    const range = botY - topY;
    const fillY = botY - (pct / 100) * range;

    // Tank path with rounded bottom corners
    const tankPath = `
      M ${L},${topY}
      Q ${L},${domeY - 5} 150,${domeY - 10}
      Q ${R},${domeY - 5} ${R},${topY}
      L ${R},${botY - cornerR}
      Q ${R},${botY} ${R - cornerR},${botY}
      L ${L + cornerR},${botY}
      Q ${L},${botY} ${L},${botY - cornerR}
      Z`;

    // Ribs
    const ribCount = 7, ribSpacing = (botY - topY) / (ribCount + 1);
    let ribs = '';
    for (let i = 1; i <= ribCount; i++) {
      const ry = topY + i * ribSpacing;
      ribs += `<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>`;
    }

    // Pump icon position — centered, above water surface
    const pumpY = Math.max(domeY + 15, fillY - 35);
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.35)';
    const pumpGlow = pumpOn ? 'drop-shadow(0 0 6px rgba(239,68,68,0.8))' : 'none';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { overflow: hidden; background: transparent !important; box-shadow: none !important; border: none !important; }
        .tank-touch { padding: 8px; cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: manipulation; }
        .tank-svg { display: block; width: 100%; max-width: 320px; margin: 0 auto; }
        @keyframes wv { 0% { transform: translateX(0); } 100% { transform: translateX(-120px); } }
        .wl { animation: wv 4s linear infinite; }
        ${pumpOn ? `@keyframes pumpPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pump-icon { animation: pumpPulse 0.8s infinite; }` : '.pump-icon {}'}
      </style>
      <ha-card>
        <div class="tank-touch">
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
              <filter id="ts"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.7)"/></filter>
            </defs>

            <!-- Fill clipped to tank -->
            <g clip-path="url(#tc)">
              <rect x="${L}" y="${fillY}" width="${R - L}" height="${botY - fillY}" fill="url(#fg)" opacity="0.9"/>
              ${pct > 2 ? `<g class="wl"><path d="M ${L - 10},${fillY} q 15,-7 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 L ${R + 10},${fillY + 12} L ${L - 10},${fillY + 12} Z" fill="rgba(255,255,255,0.15)"/></g>` : ''}
            </g>

            <!-- Tank outline -->
            <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>
            ${ribs}

            <!-- Lid -->
            <path d="M 130,${domeY - 10} L 130,${domeY - 22} Q 130,${domeY - 26} 134,${domeY - 26} L 166,${domeY - 26} Q 170,${domeY - 26} 170,${domeY - 22} L 170,${domeY - 10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
            <rect x="140" y="${domeY - 32}" width="20" height="7" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>

            <!-- Pump icon (water-pump) centered in tank, above water -->
            <g class="pump-icon" transform="translate(150, ${pumpY})" style="filter: ${pumpGlow}">
              <g transform="translate(-14, -14) scale(1.2)">
                <path d="M12 3 L12 6 M6 12 L3 12 M12 18 L12 21 M18 12 L21 12
                  M7.05 7.05 L4.93 4.93 M16.95 7.05 L19.07 4.93
                  M7.05 16.95 L4.93 19.07 M16.95 16.95 L19.07 19.07"
                  stroke="${pumpColor}" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/>
                <circle cx="12" cy="12" r="5" fill="none" stroke="${pumpColor}" stroke-width="2"/>
                <path d="M12 9 C14 9 15 10.5 15 12 C15 13.5 14 15 12 15 C10 15 9 13.5 9 12 L12 12 Z" fill="${pumpColor}" opacity="0.7"/>
              </g>
            </g>

            <!-- Percentage -->
            <text x="150" y="250" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
          </svg>
        </div>
      </ha-card>`;

    this._bindEvents();
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'SVG water tank with pump control', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;');
