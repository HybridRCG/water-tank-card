# Water Tank Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/HybridRCG/water-tank-card)](https://github.com/HybridRCG/water-tank-card/releases)

A custom Home Assistant Lovelace card displaying an animated SVG water tank with real-time fill level, pump status, and a 24-hour history sparkline. Designed to sit alongside standard HA dashboard button cards.

---

## Features

- **Animated water fill** driven by a sensor entity (0–100 %)
- **Compact mode** — matches the height of adjacent button cards; shows `Title — 96%` label (red below 50 %)
- **Full mode** — larger tank with litres row and 24h history sparkline
- **Visual config editor** — configure everything via the HA UI, no YAML required
- **Configurable tap & hold actions** — navigate, toggle pump, more-info, or none
- **Pump toggle** with optional confirmation dialog; pump icon pulses red when active
- **Custom fill colour** or automatic red → green gradient by level
- **Tank capacity** — shows calculated litres in full mode
- **24h history sparkline** (full mode) — fetched from HA history API, refreshed every 60 s
- **HA theme support** — uses `--card-background-color`, `--primary-text-color`, etc.

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

## Configuration

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level   # required — % value 0–100
title: Jojo                                          # card label
mode: compact                                        # compact (default) or full
tank_capacity: 5000                                  # litres at 100 % (full mode)
tank_color: "#1a78c2"                               # custom fill colour (omit for red→green gradient)
pump_entity: switch.borehole                         # pump switch entity
pump_confirmation: "Toggle the borehole pump?"       # confirm dialog text
tap_action: navigate                                 # navigate | toggle-pump | more-info | none
hold_action: toggle-pump                             # navigate | toggle-pump | more-info | none
navigate_to: /lovelace/jojo                          # path used by the navigate action
history_entity: sensor.jojo_tank_level_liquid_level  # sparkline entity (defaults to entity_level)
```

### All options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity_level` | string | **required** | Entity ID for tank level (0–100 %) |
| `title` | string | `Water Tank` | Card label |
| `mode` | string | `compact` | `compact` or `full` |
| `tank_capacity` | number | — | Total capacity in litres (full mode litres row) |
| `tank_color` | string | — | CSS colour for fill — omit to use red→green gradient |
| `fill_color` | string | — | Alias for `tank_color` |
| `pump_entity` | string | — | Switch entity to toggle |
| `pump_confirmation` | string | built-in prompt | Custom confirm dialog text |
| `tap_action` | string | `navigate` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `hold_action` | string | `toggle-pump` | `navigate`, `toggle-pump`, `more-info`, `none` |
| `navigate_to` | string | — | HA path for the `navigate` action (e.g. `/lovelace/jojo`) |
| `history_entity` | string | `entity_level` | Entity for 24h sparkline (full mode) |
| `entity_liters` | string | — | Separate litres entity (overrides `tank_capacity` calc) |

---

## Modes

**Compact** — 110 px, fits alongside button cards. Shows animated tank + `Title — 96%` label. Label turns red below 50 %.

```yaml
mode: compact
```

**Full** — taller card with title, litres row, and 24h history sparkline.

```yaml
mode: full
```

---

## Actions

Tap and hold are independently configurable:

| Value | Behaviour |
|---|---|
| `navigate` | Navigate to `navigate_to` path |
| `toggle-pump` | Toggle `pump_entity` with optional confirmation dialog |
| `more-info` | Open HA more-info dialog for the level entity |
| `none` | Do nothing |

**Recommended setup:**
```yaml
tap_action: navigate       # tap opens the tank detail view
hold_action: toggle-pump   # hold toggles the pump with confirmation
navigate_to: /lovelace/jojo
pump_entity: switch.borehole
pump_confirmation: "Are you sure you want to toggle the borehole pump?"
```

---

## Requirements

- Home Assistant 2024.1+
- HACS 1.x / 2.x (for HACS install)

---

## License

MIT — see [LICENSE](LICENSE)
