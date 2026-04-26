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

  getCardSize() {
    return 5;
  }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;

    const config = this._config;
    const entityLevelId = config.entity_level;
    const entityLitersId = config.entity_liters;
    const tankImage = config.background_image || config.tank_image || '';
    const title = config.title || 'Water Tank';

    const level = this._hass.states[entityLevelId];
    const liters = entityLitersId ? this._hass.states[entityLitersId] : null;

    if (!level) {
      this.shadowRoot.innerHTML = `
        <ha-card header="${title}">
          <div style="color:var(--error-color,#db4437);padding:16px;">
            <p><b>Entity not found:</b> ${entityLevelId}</p>
          </div>
        </ha-card>`;
      return;
    }

    let levelValue = 0;
    if (level.state !== 'unknown' && level.state !== 'unavailable') {
      const m = String(level.state).match(/[\d.]+/);
      if (m) levelValue = Math.min(100, Math.max(0, parseFloat(m[0]) || 0));
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

    // The fill is a gradient from red (bottom) through yellow to green (top)
    // positioned behind the tank image. The tank image acts as the frame/mask.
    // We clip the gradient to the current level percentage.
    const pct = Math.round(levelValue);
    // Map fill from ~8% bottom to ~88% top of the tank image area
    const tankTop = 8;
    const tankBottom = 88;
    const fillRange = tankBottom - tankTop;
    const fillPx = (levelValue / 100) * fillRange;
    const fillBottom = 100 - tankBottom;
    const fillTop = 100 - tankBottom + fillPx;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          overflow: hidden;
          background: transparent !important;
        }
        .tank-container {
          position: relative;
          width: 100%;
          max-width: 360px;
          margin: 0 auto;
          padding: 8px 0 0 0;
        }
        .tank-visual {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1.25;
          overflow: hidden;
        }
        /* The gradient fill sits behind the tank image */
        .tank-fill-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
          /* Full gradient from red at bottom to green at top */
          background: linear-gradient(
            to top,
            #d32f2f 0%,
            #e53935 10%,
            #f57c00 25%,
            #fbc02d 40%,
            #cddc39 55%,
            #8bc34a 70%,
            #4caf50 85%,
            #2e7d32 100%
          );
          /* Clip the gradient to only show up to the fill level */
          clip-path: inset(${100 - fillTop}% 5% ${fillBottom}% 5%);
          transition: clip-path 1s ease-out;
          z-index: 1;
        }
        /* Wave effect at the water surface */
        .tank-wave {
          position: absolute;
          left: 5%;
          right: 5%;
          height: 12px;
          bottom: ${fillTop}%;
          z-index: 2;
          overflow: hidden;
          transition: bottom 1s ease-out;
        }
        .tank-wave svg {
          width: 200%;
          height: 100%;
          animation: wave 3s linear infinite;
        }
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        /* Tank image overlays on top as the frame */
        .tank-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }
        .tank-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        /* Percentage display */
        .tank-pct {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.3);
          z-index: 4;
          letter-spacing: 1px;
        }
        /* Stats bar below the tank */
        .stats-bar {
          display: flex;
          margin: 8px 4px 4px 4px;
          gap: 8px;
        }
        .stat-box {
          flex: 1;
          background: var(--card-background-color, rgba(40,40,40,0.6));
          border-radius: 8px;
          padding: 10px 12px;
          text-align: center;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--secondary-text-color, #999);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }
        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary-text-color, #fff);
        }
      </style>
      <ha-card>
        <div class="tank-container">
          <div class="tank-visual">
            <div class="tank-fill-layer"></div>
            <div class="tank-wave">
              <svg viewBox="0 0 1200 20" preserveAspectRatio="none">
                <path d="M0,10 C150,0 350,20 600,10 C850,0 1050,20 1200,10 L1200,20 L0,20 Z" fill="#4caf50" opacity="0.6"/>
                <path d="M0,12 C200,2 400,22 600,12 C800,2 1000,22 1200,12 L1200,20 L0,20 Z" fill="#4caf50" opacity="0.4"/>
              </svg>
            </div>
            ${tankImage ? `
            <div class="tank-image">
              <img src="${tankImage}" alt="tank" />
            </div>` : ''}
            <div class="tank-pct">${pct}%</div>
          </div>
          <div class="stats-bar">
            <div class="stat-box">
              <div class="stat-label">Level</div>
              <div class="stat-value">${pct}%</div>
            </div>
            ${litersText ? `
            <div class="stat-box">
              <div class="stat-label">Remaining</div>
              <div class="stat-value">${litersText}</div>
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
  description: 'Visual water tank level card with fill animation',
  preview: true,
  documentationURL: 'https://github.com/HybridRCG/water-tank-card',
});

console.info(
  '%c WATER-TANK-CARD %c v' + CARD_VERSION + ' ',
  'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;',
  'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;',
);
