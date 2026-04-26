class WaterTankCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
  }

  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
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

    // DEBUG: Log what we're getting
    console.log('=== WATER TANK CARD DEBUG ===');
    console.log('Entity Level ID:', entityLevelId);
    console.log('Entity Level Object:', level);
    console.log('Entity Level State:', level ? level.state : 'NOT FOUND');
    console.log('Entity Level Attributes:', level ? level.attributes : 'N/A');
    console.log('---');
    console.log('Entity Liters ID:', entityLitersId);
    console.log('Entity Liters Object:', liters);
    console.log('Entity Liters State:', liters ? liters.state : 'NOT FOUND');
    console.log('Entity Liters Attributes:', liters ? liters.attributes : 'N/A');
    console.log('=============================');

    if (!level) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; color: #d32f2f; font-family: monospace; white-space: pre-wrap;">
          <strong>ERROR:</strong> Entity ${entityLevelId} not found
          
          <strong>Available entities:</strong>
          ${Object.keys(this._hass.states).filter(k => k.includes('tank') || k.includes('jojo')).map(k => `  • ${k}: ${this._hass.states[k].state}`).join('\n')}
        </div>
      `;
      return;
    }

    // Handle different value formats
    let levelValue = 0;
    if (level.state !== undefined && level.state !== null) {
      // Try to parse as number
      const parsed = parseFloat(level.state);
      levelValue = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
    }

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
          border: 1px solid var(--divider-color, #ccc);
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
        .debug-info {
          margin-top: 16px;
          padding: 12px;
          background: var(--card-background-color, #f5f5f5);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          color: var(--primary-text-color);
          white-space: pre-wrap;
          word-break: break-all;
        }
      </style>
      <div class="card-title">${title}</div>
      <div class="tank-container">
        <div class="tank-fill"></div>
        <div class="tank-level-text">${Math.round(levelValue)}%</div>
        <div class="tank-liters-text">Remaining: ${litersValue}</div>
      </div>
      <div class="debug-info">Level Value: ${levelValue}%
Raw State: ${level.state}
Liters Value: ${litersValue}
Entity: ${entityLevelId}</div>
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
