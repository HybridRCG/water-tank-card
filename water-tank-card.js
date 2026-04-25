class WaterTankCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  set hass(hass) {
    this.hass = hass;
    
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    
    // Store previous state to detect changes
    const entityLevelId = this.config.entity_level;
    const entityLitersId = this.config.entity_liters;
    
    const newLevel = this.hass.states[entityLevelId]?.state;
    const newLiters = this.hass.states[entityLitersId]?.state;
    
    // Check if values actually changed (avoid setting hass again!)
    if (this.prevLevel !== newLevel || this.prevLiters !== newLiters) {
      this.prevLevel = newLevel;
      this.prevLiters = newLiters;
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot || !this.hass) return;

    const config = this.config;
    const entityLevelId = config.entity_level;
    const entityLitersId = config.entity_liters;
    const backgroundImage = config.background_image || '/local/TANK/water_tank_background_clean.png';
    const fillImage = config.fill_image || '/local/TANK/water_fill2.png';
    const title = config.title || 'Water Tank';

    const level = this.hass.states[entityLevelId];
    const liters = this.hass.states[entityLitersId];

    if (!level) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; color: #d32f2f;">
          Entity ${entityLevelId} not found
        </div>
      `;
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
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .card-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--ha-card-header-color, var(--primary-text-color));
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
          border-radius: 8px;
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .tank-liters-text {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 14px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          z-index: 10;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

  static getConfigElement() {
    return document.createElement('water-tank-card-editor');
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
  description: 'A custom card to display water tank level with fill animation',
});
