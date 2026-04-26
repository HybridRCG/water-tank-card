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

    // Enhanced error reporting
    if (!level) {
      const similarEntities = Object.keys(this._hass.states)
        .filter(k => k.toLowerCase().includes('tank') || k.toLowerCase().includes('level') || k.toLowerCase().includes('jojo'))
        .slice(0, 10);
      
      this.shadowRoot.innerHTML = `
        <div style="padding: 16px; color: #c62828; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #c62828;">❌ Entity Not Found</h3>
          <p style="margin: 0 0 8px 0;"><strong>Looking for:</strong> ${entityLevelId}</p>
          ${similarEntities.length > 0 ? `
            <p style="margin: 0 0 8px 0;"><strong>Similar entities found:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              ${similarEntities.map(e => `<li>${e}</li>`).join('')}
            </ul>
          ` : '<p style="margin: 0;">No similar entities found.</p>'}
        </div>
      `;
      return;
    }

    // Parse level value - handle multiple formats
    let levelValue = 0;
    if (level.state !== undefined && level.state !== null && level.state !== 'unknown' && level.state !== 'unavailable') {
      // Extract numeric value (handles "75.5%", "75.5", "75%" formats)
      const match = String(level.state).match(/[\d.]+/);
      if (match) {
        const parsed = parseFloat(match[0]);
        levelValue = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
      }
    }

    // Parse liters value - extract number if it has units
    let litersDisplay = 'N/A';
    if (liters && liters.state !== undefined && liters.state !== null) {
      // If it's a number with units like "250 L" or "250L", extract just the number
      const match = String(liters.state).match(/[\d.]+/);
      if (match) {
        litersDisplay = match[0];
        // Add unit if the state has one
        if (String(liters.state).toLowerCase().includes('l')) {
          litersDisplay += ' L';
        }
      } else {
        litersDisplay = liters.state;
      }
    }

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
          color: var(--primary-text-color, #212121);
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
          border: 2px solid #ddd;
          border-radius: 4px;
          box-shadow: inset 0 0 8px rgba(0,0,0,0.05);
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
          opacity: 0.9;
          transition: height 0.8s ease-out;
          z-index: 5;
          border-top: 2px solid rgba(0,0,0,0.1);
        }
        .tank-level-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          font-weight: bold;
          color: #fff;
          text-shadow: 
            0 2px 4px rgba(0,0,0,0.6),
            -2px -2px 4px rgba(0,0,0,0.3);
          z-index: 10;
          letter-spacing: 1px;
        }
        .tank-liters-text {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.6);
          z-index: 10;
          background: rgba(0,0,0,0.2);
          padding: 4px 8px;
          border-radius: 3px;
        }
        .tank-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
          font-size: 13px;
        }
        .stat-item {
          padding: 8px;
          background: var(--card-background-color, #f5f5f5);
          border-radius: 4px;
          border-left: 3px solid #2196F3;
        }
        .stat-label {
          font-size: 11px;
          color: var(--secondary-text-color, #666);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: var(--primary-text-color, #212121);
          margin-top: 4px;
        }
      </style>
      <div class="card-title">${title}</div>
      <div class="tank-container">
        <div class="tank-fill"></div>
        <div class="tank-level-text">${Math.round(levelValue)}%</div>
        <div class="tank-liters-text">Remaining: ${litersDisplay}</div>
      </div>
      <div class="tank-stats">
        <div class="stat-item">
          <div class="stat-label">Level</div>
          <div class="stat-value">${Math.round(levelValue)}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Remaining</div>
          <div class="stat-value">${litersDisplay}</div>
        </div>
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
