const CARD_VERSION = '2.8.0';

// ══════════════════════════════════════════════════════════
//  PHASE 3 — Visual Config Editor
// ══════════════════════════════════════════════════════════
class WaterTankCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  _dispatch() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _entities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states).sort();
  }

  _entityOptions(includeBlank = true) {
    const opts = includeBlank ? ['<option value="">— none —</option>'] : [];
    this._entities().forEach(e => {
      const sel = (val) => val === e ? 'selected' : '';
      opts.push(`<option value="${e}" ${sel(this._config.entity_level || '')} data-for="entity_level">${e}</option>`);
    });
    return opts.join('');
  }

  _entitySelect(field, value) {
    const opts = ['<option value="">— none —</option>',
      ...this._entities().map(e => `<option value="${e}"${e === value ? ' selected' : ''}>${e}</option>`)
    ].join('');
    return `<select data-field="${field}">${opts}</select>`;
  }

  _render() {
    const c = this._config;
    const entities = this._entities();
    const entityOpts = (current) => ['<option value="">— none —</option>',
      ...entities.map(e => `<option value="${e}"${e === current ? ' selected' : ''}>${e}</option>`)
    ].join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .editor { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
        label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--primary-text-color); }
        input, select {
          padding: 6px 8px; border-radius: 6px; border: 1px solid var(--divider-color, #ccc);
          background: var(--card-background-color, #fff); color: var(--primary-text-color);
          font-size: 13px; width: 100%; box-sizing: border-box;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .section { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--secondary-text-color); margin-top: 4px; border-bottom: 1px solid var(--divider-color,#eee); padding-bottom: 3px; }
        input[type=color] { height: 34px; padding: 2px 4px; cursor: pointer; }
        .hint { font-size: 11px; color: var(--secondary-text-color); margin-top: -6px; }
      </style>
      <div class="editor">
        <div class="section">Required</div>
        <label>Tank Level Entity (%)
          <select data-field="entity_level">${entityOpts(c.entity_level)}</select>
        </label>

        <div class="section">Display</div>
        <div class="row">
          <label>Title
            <input type="text" data-field="title" value="${c.title || ''}">
          </label>
          <label>Mode
            <select data-field="mode">
              <option value="compact"${(c.mode || 'compact') === 'compact' ? ' selected' : ''}>Compact</option>
              <option value="full"${c.mode === 'full' ? ' selected' : ''}>Full</option>
            </select>
          </label>
        </div>

        <div class="section">Capacity</div>
        <label>Tank Capacity (litres)
          <input type="number" data-field="tank_capacity" value="${c.tank_capacity || ''}" placeholder="e.g. 5000">
        </label>
        <p class="hint">Calculates litres from % if set. Leave blank to hide.</p>

        <div class="section">Colour</div>
        <label>Custom Fill Colour (overrides red→green gradient)
          <input type="color" data-field="tank_color" value="${c.tank_color || c.fill_color || '#1a78c2'}">
        </label>
        <p class="hint">Leave as #1a78c2 and uncheck to use the default gradient. Delete the value in YAML to restore gradient.</p>

        <div class="section">Pump</div>
        <label>Pump Entity
          <select data-field="pump_entity">${entityOpts(c.pump_entity)}</select>
        </label>
        <label>Pump Confirmation Message
          <input type="text" data-field="pump_confirmation" value="${c.pump_confirmation || ''}" placeholder="Are you sure you want to Toggle the Borehole Pump?">
        </label>

        <div class="section">Navigation</div>
        <label>Hold to Navigate (path)
          <input type="text" data-field="navigate_to" value="${c.navigate_to || ''}" placeholder="/lovelace/tanks">
        </label>
      </div>`;

    this.shadowRoot.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('change', (e) => {
        const field = e.target.dataset.field;
        const val = e.target.value;
        if (val === '' || val === undefined) {
          const updated = { ...this._config };
          delete updated[field];
          this._config = updated;
        } else {
          this._config = { ...this._config, [field]: field === 'tank_capacity' ? parseFloat(val) : val };
        }
        this._dispatch();
      });
      el.addEventListener('input', (e) => {
        if (e.target.type !== 'color') return;
        const field = e.target.dataset.field;
        this._config = { ...this._config, [field]: e.target.value };
        this._dispatch();
      });
    });
  }
}

customElements.define('water-tank-card-editor', WaterTankCardEditor);

