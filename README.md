# Water Tank Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/HybridRCG/water-tank-card)](https://github.com/HybridRCG/water-tank-card/releases)

A custom Home Assistant Lovelace card displaying an animated SVG water tank with real-time fill level, pump controls, stats panel, and 24h history sparkline. Designed as a self-contained card — no horizontal-stack or markdown cards needed.

---

## Features

- **Animated water fill** driven by a sensor entity (0–100 %)
- **Compact mode** — 110 px, sits alongside standard button cards; shows `Title — 96%` label (red below threshold)
- **Full mode** — two-column layout: animated tank on the left, toggle switches + stats panel on the right
- **Low water warning** — pulsing ⚠️ badge + red warning bar when below configurable threshold
- **Pump runtime tracker** — shows `Pump running 2h 27min` in real time while pump is on
- **Last updated** — shows how long ago the level sensor last changed
- **Toggle switches** — Borehole, Automated, Notify (or any switches) rendered as ON/OFF buttons in the right column
- **Stats panel** — Litres left, Used today, Pump today, Power now, Daily kWh, Monthly kWh
- **Pump today** — displays as `2h 27min` (handles decimal hours, minutes, seconds automatically)
- **24h history sparkline** (full mode left column)
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

### Full
Two-column self-contained card. Tank + sparkline on the left, toggle switches + stats on the right.

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
mode: full
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
| `mode` | string | `compact` | `compact` or `full` |
| `warn_below` | number | `50` | Warning badge/bar threshold (%) |
| `tank_capacity` | number | — | Total capacity in litres |
| `tank_color` | string | — | Custom fill colour — omit for red→green gradient |
| `fill_color` | string | — | Alias for `tank_color` |
| `pump_entity` | string | — | Switch entity to toggle |
| `pump_confirmation` | string | built-in | Confirm dialog text |
| `tap_action` | string | `navigate` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `hold_action` | string | `toggle-pump` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `navigate_to` | string | — | HA path for the `navigate` action |
| `entity_liters` | string | — | Litres left entity (overrides `tank_capacity` calc) |
| `entity_daily_used` | string | — | Daily water used entity |
| `entity_pump_today` | string | — | Pump on today entity (minutes, decimal hours, or seconds) |
| `entity_power` | string | — | Current power draw entity |
| `entity_daily_kwh` | string | — | Daily kWh entity |
| `entity_monthly_kwh` | string | — | Monthly kWh entity |
| `toggles` | list | — | Switch entities for the right-column toggle panel |
| `history_entity` | string | `entity_level` | Entity for 24h sparkline |

### Toggle entry format

```yaml
toggles:
  - entity: switch.my_switch      # required
    name: My Switch               # optional — overrides friendly_name
    icon: mdi:electric-switch     # optional — mdi icon
```

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
