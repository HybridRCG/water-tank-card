const CARD_VERSION = '1.5.0';

class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._config = null;
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

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const c = this._config;
    const level = this._hass.states[c.entity_level];
    const liters = c.entity_liters ? this._hass.states[c.entity_liters] : null;
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

    // Tank geometry — straight sides, dome top, flat bottom
    // viewBox 0 0 300 380
    const L = 70;   // left edge of tank body
    const R = 230;  // right edge of tank body
    const domeY = 60;  // top of dome curve
    const topY = 80;   // where straight sides begin
    const botY = 340;  // bottom of tank (flat)

    // Fill: gradient from botY up to the level
    const range = botY - topY;
    const fillY = botY - (pct / 100) * range;

    // Tank body path — straight sides, curved dome top, flat bottom
    const tankPath = `M ${L},${topY} Q ${L},${domeY - 5} 150,${domeY - 10} Q ${R},${domeY - 5} ${R},${topY} L ${R},${botY} L ${L},${botY} Z`;

    // Rib Y positions (evenly spaced horizontal lines)
    const ribCount = 7;
    const ribSpacing = (botY - topY) / (ribCount + 1);
    let ribs = '';
    for (let i = 1; i <= ribCount; i++) {
      const ry = topY + i * ribSpacing;
      ribs += `<line x1="${L}" y1="${ry}" x2="${R}" y2="${ry}" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { overflow: hidden; background: transparent !important; box-shadow: none !important; border: none !important; }
        .wrap { padding: 8px; }
        .tank-svg { display: block; width: 100%; max-width: 320px; margin: 0 auto; }
        @keyframes wv { 0% { transform: translateX(0); } 100% { transform: translateX(-120px); } }
        .wl { animation: wv 4s linear infinite; }
      </style>
      <ha-card>
        <div class="wrap">
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

            <!-- Fill clipped to tank shape -->
            <g clip-path="url(#tc)">
              <rect x="${L}" y="${fillY}" width="${R - L}" height="${botY - fillY}" fill="url(#fg)" opacity="0.9"/>
              ${pct > 2 ? `<g class="wl"><path d="M ${L - 10},${fillY} q 15,-7 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 L ${R + 10},${fillY + 12} L ${L - 10},${fillY + 12} Z" fill="rgba(255,255,255,0.15)"/></g>` : ''}
            </g>

            <!-- Tank outline — straight sides, dome top, flat bottom -->
            <path d="${tankPath}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>

            <!-- Ribs -->
            ${ribs}

            <!-- Lid -->
            <path d="M 130,${domeY - 10} L 130,${domeY - 22} Q 130,${domeY - 26} 134,${domeY - 26} L 166,${domeY - 26} Q 170,${domeY - 26} 170,${domeY - 22} L 170,${domeY - 10}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
            <rect x="140" y="${domeY - 32}" width="20" height="7" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>

            <!-- Percentage -->
            <text x="150" y="235" text-anchor="middle" dominant-baseline="central" font-size="52" font-weight="800" fill="#fff" filter="url(#ts)">${p}%</text>
          </svg>
        </div>
      </ha-card>`;
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'SVG water tank level card', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;');
