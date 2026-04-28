# Water Tank Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/HybridRCG/water-tank-card)](https://github.com/HybridRCG/water-tank-card/releases)

A custom Home Assistant Lovelace card that displays an animated water tank with real-time fill level, pump status, and optional capacity readout. Designed to sit alongside standard HA button cards in a grid.

---

## Features

- Animated water fill driven by a sensor entity (%)
- Compact mode — matches the height of adjacent button cards
- Pump entity support with tap-to-toggle and hold-to-confirm dialog
- Configurable title, tank capacity (litres), and fill colour
- Adapts to light and dark HA themes via CSS variables

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
pump_entity: switch.borehole_pump                    # enables tap-to-toggle
tank_capacity: 5000                                  # litres at 100 %
fill_color: "#1a78c2"                               # custom fill colour
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity_level` | string | **required** | Entity ID for tank level (0–100 %) |
| `title` | string | `Water Tank` | Card label |
| `pump_entity` | string | — | Switch to toggle on tap |
| `pump_confirmation` | string | built-in prompt | Custom confirm dialog text |
| `tank_capacity` | number | — | Total capacity in litres |
| `fill_color` | string | `#1a78c2` | CSS colour for the water fill |

---

## Requirements

- Home Assistant 2024.1+
- HACS 1.x / 2.x (for HACS install)

---

## License

MIT — see [LICENSE](LICENSE)
