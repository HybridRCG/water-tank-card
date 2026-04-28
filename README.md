# Water Tank Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/HybridRCG/water-tank-card)](https://github.com/HybridRCG/water-tank-card/releases)

A custom Home Assistant Lovelace card displaying an animated SVG water tank with real-time fill level, pump status, capacity readout, and a 24-hour history sparkline. Designed to blend seamlessly with standard HA dashboard button cards.

---

## Features

- **Animated water fill** driven by a sensor entity (0–100 %)
- **Compact mode** — matches the height of adjacent button cards (110 px)
- **Full mode** — larger tank with title, litres row, and 24h history sparkline
- **Visual config editor** — configure everything via the HA UI, no YAML required
- **Pump entity** — tap to toggle with an optional confirmation dialog
- **Custom fill colour** or automatic red → green gradient by level
- **Tank capacity** — shows calculated litres beneath the percentage
- **24h history sparkline** (full mode) — fetched from HA history API
- **More-info dialog** — configurable tap action
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
tank_capacity: 5000                                  # litres at 100 %
tank_color: "#1a78c2"                               # custom fill colour (omit for red→green gradient)
pump_entity: switch.borehole_pump                    # enables pump toggle on tap
pump_confirmation: "Toggle the borehole pump?"       # custom confirm dialog text
tap_action: pump                                     # pump | more-info | none
navigate_to: /lovelace/tanks                         # hold action — navigate to path
history_entity: sensor.jojo_tank_level_liquid_level  # entity for sparkline (defaults to entity_level)
```

### All options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity_level` | string | **required** | Entity ID for tank level (0–100 %) |
| `title` | string | `Water Tank` | Card label |
| `mode` | string | `compact` | `compact` or `full` |
| `tank_capacity` | number | — | Total capacity in litres — shows calculated litres |
| `tank_color` | string | — | CSS colour for fill (omit to use red→green gradient) |
| `fill_color` | string | — | Alias for `tank_color` |
| `pump_entity` | string | — | Switch/input_boolean to toggle on tap |
| `pump_confirmation` | string | built-in prompt | Custom confirm dialog text |
| `tap_action` | string | `pump` | `pump`, `more-info`, or `none` |
| `navigate_to` | string | — | Path to navigate on hold (e.g. `/lovelace/0`) |
| `history_entity` | string | `entity_level` | Entity to pull 24h sparkline history from |
| `entity_liters` | string | — | Separate entity for litre readout (overrides `tank_capacity` calc) |

---

## Modes

**Compact** — fits a 110 px grid cell alongside button cards:
```yaml
mode: compact
```

**Full** — taller card with title, litres, sparkline:
```yaml
mode: full
```

---

## Requirements

- Home Assistant 2024.1+
- HACS 1.x / 2.x (for HACS install)

---

## License

MIT — see [LICENSE](LICENSE)
