class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;  // Private field for hass - NO setter recursion!
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    // Store in private field - never calls the setter again
    this._hass = hass;
    
    // Create shadowRoot on first call
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    // Always render - Home Assistant will handle updates efficiently
    this.render();
  }

  render() {
    if (!this.shadowRoot || !this._hass || !this.config) return;

    const entityLevelId = this.config.entity_level;
    const entityLitersId = this.config.entity_liters;
    const backgroundImage = this.config.background_image || '/local/TANK/water_tank_background_clean.png';
    const fillImage = this.config.fill_image || '/local/TANK/water_fill2.png';
    const title = this.config.title || 'Water Tank';

    const level = this._hass.states[entityLevelId];
    const liters = this._hass.states[entityLitersId];

    if (!level) {
      this.shadowRoot.innerHTML = `<div style="padding: 16px; color: #d32f2f;">Entity ${entityLevelId} not found</div>`;
      return;
    }

    const levelValue = parseFloat(level.state) || 0;
    const litersValue = liters ? liters.state : 'N/A';
    const fillHeight = Math.min(100, Math.max(0, levelValue));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
        }
        .card-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color);
        }
        .tank-container {
          position: relative;
          width: 100%;
          max-width: 350px;
          margin: 0 auto;
          aspect-ratio: 1 / 1.2;
          background-image: url('${backgroundImage}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          overflow: hidden;
        }
        .tank-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: ${fillHeight}%;
          background-image: url('${fillImage}');
          background-size: cover;
          background-position: center bottom;
          opacity: 0.85;
          transition: height 0.5s ease-out;
          z-index: 5;
        }
        .tank-level-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          font-weight: bold;
          color: white;
          text-shadow: 0 2px 6px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .tank-liters-text {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 14px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          z-index: 10;
        }
      </style>
      <div class="card-title">${title}</div>
      <div class="tank-container">
        <div class="tank-fill"></div>
        <div class="tank-level-text">${Math.round(levelValue)}%</div>
        <div class="tank-liters-text">Remaining: ${litersValue} L</div>
      </div>
    `;
  }

  static getStubConfig() {
    return {
      entity_level: 'sensor.tank_level',
      entity_liters: 'sensor.tank_liters',
      title: 'Water Tank',
      background_image: '/local/TANK/water_tank_background_clean.png',
      fill_image: '/local/TANK/water_fill2.png',
    };
  }
}

customElements.define('water-tank-card', WaterTankCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'water-tank-card',
  name: 'Water Tank Card',
  description: 'Water tank level visualization with animation',
});
