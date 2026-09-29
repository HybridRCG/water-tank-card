# Water Tank Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/HybridRCG/water-tank-card)](https://github.com/HybridRCG/water-tank-card/releases)

A custom Home Assistant Lovelace card displaying an animated SVG water tank with real-time fill level, pump controls, stats panel, and 24h history sparkline. Designed as a self-contained card — no horizontal-stack or markdown cards needed.

---

## Features

- **Animated water fill** driven by a sensor entity (0–100 %)
- **Compact mode** — 110 px, sits alongside standard button cards; shows `Title — 96%` label (red below threshold)
- **Medium mode** — two-column layout: animated tank on the left, toggles + stats on the right
- **Full mode** — stacked layout: enlarged tank on top, toggles + stats panel below
- **Low water warning** — pulsing ⚠️ badge + red warning bar when below configurable threshold
- **Pump runtime tracker** — shows `Pump running 2h 27min` in real time while pump is on
- **Last updated** — shows how long ago the level sensor last changed
- **Toggle buttons** — any `switch`, `input_boolean`, `light`, `fan`, `automation` (and more) as live ON/OFF buttons, with optional per-toggle confirmation
- **Stats panel** — Litres left, Used today, Pump today, Power now, Daily kWh, Monthly kWh (only configured rows are shown; units come from the sensor)
- **Pump today** — displays as `2h 27min` (handles decimal hours, minutes, seconds automatically)
- **24h history sparkline** (medium & full modes, refreshed every 5 min)
- **Visual config editor** — no YAML required
- **Configurable tap & hold actions** — navigate, toggle pump, more-info, or none
- **HA theme support** — uses `--card-background-color`, `--primary-text-color`, etc.
- **Sensor unavailable state** — shows 📡 icon instead of crashing

---

## Installation

### Via HACS (recommended)

1. In HACS → **Frontend** → ⋮ → **Custom repositories**
2. Add `https://github.com/HybridRCG/water-tank-card` — type **Lovelace**
3. Install **Water Tank Card**
4. Reload the browser

### Manual

1. Copy `water-tank-card.js` to `/config/www/`
2. **Settings → Dashboards → Resources** → add `/local/water-tank-card.js` as **JavaScript module**
3. Reload

---

## Modes

### Compact
110 px card, fits alongside standard button cards. Shows animated tank + `Title — 96%` label. Label turns red below `warn_below` threshold.

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
title: Jojo
mode: compact
warn_below: 50
```

### Medium
Two-column self-contained card. Tank + sparkline on the left, toggles + stats on the right. Best at full dashboard width.

### Full
Stacked layout — enlarged tank on top, toggles + stats panel below. Best in a narrow column or on mobile.

Medium and full take the same options:

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
mode: full        # or: medium
pump_entity: switch.borehole
pump_confirmation: Are you sure you want to Toggle the Borehole Pump?
tap_action: none
hold_action: toggle-pump
tank_capacity: 5000
warn_below: 50
entity_daily_used: input_number.jojo_daily_water_used
entity_pump_today: sensor.borehole_on_today
entity_power: sensor.borehole_power
entity_daily_kwh: sensor.borehole_daily_consumption
entity_monthly_kwh: sensor.borehole_monthly_consumption
toggles:
  - entity: switch.borehole
    name: Borehole
    icon: mdi:electric-switch
  - entity: switch.borehole_enabled
    name: Automated
    icon: mdi:water-pump
  - entity: switch.notifyjojo
    name: Notify
    icon: mdi:message-alert
```

---

## All Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity_level` | string | **required** | Entity ID for tank level (0–100 %) |
| `title` | string | `Water Tank` | Card label |
| `mode` | string | `compact` | `compact`, `medium` or `full` |
| `warn_below` | number | `50` | Warning badge/bar threshold (%) |
| `tank_capacity` | number | — | Total capacity in litres |
| `tank_color` | string | — | Custom fill colour — omit for red→green gradient |
| `fill_color` | string | — | Alias for `tank_color` |
| `pump_entity` | string | — | Pump entity to toggle (any toggle-able domain) |
| `pump_confirmation` | string | built-in | Confirm dialog text |
| `tap_action` | string | `navigate` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `hold_action` | string | `toggle-pump` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `navigate_to` | string | — | HA path for the `navigate` action |
| `entity_liters` | string | — | Litres left entity (overrides `tank_capacity` calc) |
| `entity_daily_used` | string | — | Daily water used entity |
| `entity_pump_today` | string | — | Pump on today entity (minutes, decimal hours, or seconds) |
| `entity_power` | string | — | Current power draw entity (W or kW, taken from the sensor) |
| `entity_daily_kwh` | string | — | Daily kWh entity |
| `entity_monthly_kwh` | string | — | Monthly kWh entity |
| `toggles` | list | — | Entities for the toggles panel (medium & full) |
| `history_entity` | string | `entity_level` | Entity for 24h sparkline |

### Toggle entry format

```yaml
toggles:
  - entity: switch.my_switch      # required — switch, input_boolean, light, fan, automation, …
    name: My Switch               # optional — overrides friendly_name
    icon: mdi:electric-switch     # optional — mdi icon
    confirmation: Are you sure?   # optional — ask before toggling
  - input_boolean.holiday_mode    # shorthand: just the entity id
```

Buttons flip instantly when tapped and then follow the real entity state. If HA doesn't confirm the change within 4 s (for example an automation switches it straight back), the button resyncs to the actual state. Unavailable entities show a disabled **N/A** button.

---

## Actions

| Value | Behaviour |
|---|---|
| `navigate` | Navigate to `navigate_to` path |
| `toggle-pump` | Toggle `pump_entity` with confirmation dialog |
| `more-info` | Open HA more-info dialog for the level entity |
| `none` | Do nothing |

---

## Requirements

- Home Assistant 2024.1+
- HACS 1.x / 2.x (for HACS install)

---

## License

MIT — see [LICENSE](LICENSE)

---

## Changelog

### 4.2.0
- **Fix:** toggle buttons (e.g. *Automated*) now update when their state changes — previously the card only redrew on tank level or pump changes, so a button kept showing ON and the next tap turned it back on
- **Fix:** toggles and the pump now call the right service per domain (`input_boolean`, `automation`, `light`, … no longer fail silently)
- **Fix:** visual editor toggles box is now parsed into `toggles` (it previously saved an unused `toggles_yaml` key)
- **Fix:** power shows the sensor's own unit (W was mislabelled as kW)
- **Fix:** tapping the pump icon no longer also fires the tank tap action
- **Fix:** "Updated x min ago" keeps ticking and the sparkline refreshes every 5 min; timers are released when the card is removed
- **New:** per-toggle `confirmation`, shorthand toggle entries, disabled **N/A** state for unavailable entities, accessible `role="switch"` buttons
- **New:** stats panel hides rows you haven't configured
- Removed the stale `water-tank-card-editor.js` (v2.8.0 leftover — the editor lives in `water-tank-card.js`)

### 4.1.3
- Added `medium` mode (the previous side-by-side layout)

### 4.1.2
- `full` mode switched to a stacked single-column layout
