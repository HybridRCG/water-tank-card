const CARD_VERSION = '1.9.0';

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
    if (!el) return;
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

    // Pump state
    const pe = c.pump_entity;
    const pump = pe ? this._hass.states[pe] : null;
    const pumpOn = pump && pump.state === 'on';
    const pumpColor = pumpOn ? '#ef4444' : 'rgba(255,255,255,0.35)';

    // Fill color based on level
    let fillColor = '#4ade80';
    if (pct < 40) fillColor = '#facc15';
    if (pct < 20) fillColor = '#ef4444';

    const glow = pumpOn ? '0 0 12px rgba(239,68,68,0.7)' : 'none';

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
          display: grid;
          align-items: center;
          justify-items: center;
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
          gap: 6px;
          padding-top: 2px;
        }
        .tank-box {
          width: 40px;
          height: 58px;
          border-radius: 8px;
          border: 2px solid rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
          background: rgba(0,0,0,0.25);
          box-shadow: ${glow};
        }
        .tank-fill {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: ${pct}%;
          background: ${fillColor};
          transition: height 0.6s ease;
        }
        .tank-pct {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: white;
          text-shadow: 0 0 6px rgba(0,0,0,0.9);
          z-index: 2;
        }
        .pump-icon {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          z-index: 3;
        }
        .pump-icon svg {
          width: 100%;
          height: 100%;
        }
        ${pumpOn ? `
        .pump-icon {
          animation: pumpPulse 0.8s infinite;
        }` : ''}
        @keyframes pumpPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .tank-label {
          font-size: 18px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          line-height: 1;
          margin-top: -2px;
        }
      </style>

      <ha-card>
        <div class="card-touch">
          <div class="tank-box">
            <div class="tank-fill"></div>
            <div class="tank-pct">${p}%</div>
            ${pe ? `<div class="pump-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19,14.5C19,14.5 21,16.67 21,18A2,2 0 0,1 19,20A2,2 0 0,1 17,18C17,16.67 19,14.5 19,14.5M5,18V9A2,2 0 0,1 3,7A2,2 0 0,1 5,5V4A2,2 0 0,1 7,2H9A2,2 0 0,1 11,4V5H19A2,2 0 0,1 21,7V9L21,11A1,1 0 0,1 22,12A1,1 0 0,1 21,13H17A1,1 0 0,1 16,12A1,1 0 0,1 17,11V9H11V18H12A2,2 0 0,1 14,20V22H2V20A2,2 0 0,1 4,18H5Z" fill="${pumpColor}"/>
              </svg>
            </div>` : ''}
          </div>
          <div class="tank-label">${title}</div>
        </div>
      </ha-card>`;

    this._bindEvents();
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'water-tank-card', name: 'Water Tank Card', description: 'Compact water tank card with pump control', preview: true, documentationURL: 'https://github.com/HybridRCG/water-tank-card' });
console.info('%c WATER-TANK-CARD %c v' + CARD_VERSION, 'color:#fff;background:#2e7d32;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold;', 'color:#2e7d32;background:#e8f5e9;padding:2px 6px;border-radius:0 3px 3px 0;');
