const CARD_VERSION = '1.4.0';

class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._config = null;
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return {
      entity_level: '',
      entity_liters: '',
      title: 'Water Tank',
    };
  }

  setConfig(config) {
    if (!config.entity_level) {
      throw new Error('Please define entity_level');
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 5; }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const c = this._config;
    const level = this._hass.states[c.entity_level];
    const liters = c.entity_liters ? this._hass.states[c.entity_liters] : null;
    const title = c.title || 'Water Tank';

    if (!level) {
      this.shadowRoot.innerHTML = `<ha-card header="${title}">
        <div style="color:#db4437;padding:16px"><b>Entity not found:</b> ${c.entity_level}</div>
      </ha-card>`;
      return;
    }

    let pct = 0;
    if (level.state !== 'unknown' && level.state !== 'unavailable') {
      const m = String(level.state).match(/[\d.]+/);
      if (m) pct = Math.min(100, Math.max(0, parseFloat(m[0]) || 0));
    }

    let litersText = '';
    if (liters && liters.state !== 'unknown' && liters.state !== 'unavailable') {
      const m = String(liters.state).match(/[\d.]+/);
      if (m) {
        litersText = m[0];
        const u = liters.attributes && liters.attributes.unit_of_measurement;
        if (u) litersText += ' ' + u;
      }
    }

    const p = Math.round(pct);
    // SVG tank dimensions
    // viewBox: 0 0 300 380
    // Tank body: x=40..260, top dome at y~60, bottom at y~340
    // Lid: centered at top
    // Ribs: horizontal bands with slight bulge on right side
    // Fill: gradient clipped to tank interior shape

    // The fill rises from bottom (y=340) to top (y=70)
    // fillY = top of the water level
    const tankTop = 70;
    const tankBot = 340;
    const range = tankBot - tankTop;
    const fillY = tankBot - (pct / 100) * range;

    // Color stops for the gradient (red bottom to green top)
    // We want the gradient to always span the full tank height
    // so colors correspond to absolute position in the tank

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card { overflow: hidden; background: transparent !important; }
        .card-wrap { padding: 12px 12px 8px; }
        .tank-svg { display: block; width: 100%; max-width: 320px; margin: 0 auto; }
        @keyframes waveMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        .wave-line {
          animation: waveMove 4s linear infinite;
        }
        .stats-bar {
          display: flex; margin: 10px 0 0; gap: 8px;
        }
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
      </style>
      <ha-card>
        <div class="card-wrap">
          <svg class="tank-svg" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Gradient for the fill: red at bottom, green at top -->
              <linearGradient id="fillGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stop-color="#d32f2f"/>
                <stop offset="15%" stop-color="#e53935"/>
                <stop offset="30%" stop-color="#f57c00"/>
                <stop offset="50%" stop-color="#fbc02d"/>
                <stop offset="70%" stop-color="#cddc39"/>
                <stop offset="85%" stop-color="#66bb6a"/>
                <stop offset="100%" stop-color="#43a047"/>
              </linearGradient>

              <!-- Tank interior shape for clipping the fill -->
              <clipPath id="tankClip">
                <path d="
                  M 60,70
                  Q 60,55 150,52
                  Q 240,55 240,70
                  L 244,100
                  Q 248,120 248,140
                  L 252,170
                  Q 256,190 252,210
                  L 248,240
                  Q 244,260 248,280
                  L 252,310
                  Q 254,330 245,340
                  Q 240,345 150,348
                  Q 60,345 55,340
                  Q 46,330 48,310
                  L 52,280
                  Q 56,260 52,240
                  L 48,210
                  Q 44,190 48,170
                  L 52,140
                  Q 56,120 52,100
                  Z
                "/>
              </clipPath>
            </defs>

            <!-- Fill: gradient rectangle clipped to tank shape, height based on level -->
            <g clip-path="url(#tankClip)">
              <rect x="40" y="${fillY}" width="220" height="${tankBot - fillY}" fill="url(#fillGrad)" opacity="0.88"/>

              <!-- Animated wave at water surface -->
              ${pct > 2 ? `
              <g class="wave-line">
                <path d="
                  M 30,${fillY}
                  q 15,-8 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0 t 30,0
                  L 300,${fillY + 15}
                  L 30,${fillY + 15} Z
                " fill="rgba(255,255,255,0.15)"/>
              </g>` : ''}
            </g>

            <!-- Tank body outline with ribs (JoJo style) -->
            <path d="
              M 60,70
              Q 60,55 150,52
              Q 240,55 240,70
              L 244,100
              Q 248,120 248,140
              L 252,170
              Q 256,190 252,210
              L 248,240
              Q 244,260 248,280
              L 252,310
              Q 254,330 245,340
              Q 240,345 150,348
              Q 60,345 55,340
              Q 46,330 48,310
              L 52,280
              Q 56,260 52,240
              L 48,210
              Q 44,190 48,170
              L 52,140
              Q 56,120 52,100
              Z
            " fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5"/>

            <!-- Horizontal rib lines -->
            <path d="M 52,100 Q 150,95 244,100" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 48,140 Q 150,135 252,140" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 48,175 Q 150,170 252,175" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 48,210 Q 150,205 252,210" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 52,245 Q 150,240 248,245" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 48,280 Q 150,275 252,280" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <path d="M 48,310 Q 150,305 252,310" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>

            <!-- Lid on top of dome -->
            <path d="M 130,52 L 130,42 Q 130,38 134,38 L 166,38 Q 170,38 170,42 L 170,52" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
            <rect x="140" y="32" width="20" height="8" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>

            <!-- Percentage text -->
            <text x="150" y="215" text-anchor="middle" dominant-baseline="central"
              font-size="52" font-weight="800" fill="#fff"
              style="text-shadow: 0 2px 8px rgba(0,0,0,0.6);"
              filter="url(#textShadow)">${p}%</text>

            <!-- Text shadow filter -->
            <defs>
              <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.7)"/>
              </filter>
            </defs>
          </svg>

          <div class="stats-bar">
            <div class="stat-box">
              <div class="stat-label">Level</div>
              <div class="stat-val">${p}%</div>
            </div>
            ${litersText ? `
            <div class="stat-box">
              <div class="stat-label">Remaining</div>
              <div class="stat-val">${litersText}</div>
            </div>` : ''}
          </div>
        </div>
      </ha-card>`;
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'water-tank-card',
  name: 'Water Tank Card',
  description: 'SVG water tank level card with gradient fill',
  preview: true,
  documentationURL: 'https://github.com/HybridRCG/water-tank-card',
});
console.info(
  '%c WATER-TANK-CARD %c v' + CARD_VERSION + ' ',
  'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;',
  'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;',
);
