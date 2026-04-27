# Water Tank Card

A custom Home Assistant Lovelace card for displaying water tank levels with a pure SVG tank visualization, gradient fill, animated wave, and integrated pump control.

![Water Tank Compact](https://github.com/user-attachments/assets/6d682f7d-7814-48b7-a4d6-9b2bc476cbc3)

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/hybridrcg)

## Features

- 🎨 Pure SVG tank rendering — no external images needed
- 🌊 Dynamic gradient fill (red → orange → yellow → green) based on level
- 💧 Animated wave at the water surface
- 🔧 Two display modes: **compact** (button-card size) and **full** (detailed view)
- 💡 Integrated pump control with tap-to-toggle and confirmation dialog
- 🔴 Pump icon flashes red when pump is active
- 📱 Hold to navigate to a detailed view
- 🏠 Matches Home Assistant dark theme with CSS variables

## Installation

### Via HACS (Recommended)

1. Open Home Assistant
2. Go to **HACS** → **Frontend**
3. Click the three dots menu → **Custom repositories**
4. Add: `https://github.com/HybridRCG/water-tank-card`
5. Select **Dashboard** as the category
6. Click **Install**

### Manual Installation

1. Download `water-tank-card.js` from the [latest release](https://github.com/HybridRCG/water-tank-card/releases/latest)
2. Place it in `/config/www/water-tank-card/`
3. Add this resource to your dashboard:

```yaml
resources:
  - url: /local/water-tank-card/water-tank-card.js
    type: module
```

## Configuration

### Compact Mode (for button grids)

Designed to fit alongside `custom:button-card` in a grid — 110px height, matching styling.

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
title: Jojo
mode: compact
pump_entity: switch.borehole
pump_confirmation: Are you sure you want to Toggle the Borehole Pump?
navigate_to: /lovelace/jojo
```

- **Tap** → Toggle pump with confirmation
- **Hold** → Navigate to detailed view

### Full Mode (for dedicated pages)

Big detailed SVG tank for a dedicated dashboard page.

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
mode: full
pump_entity: switch.borehole
pump_confirmation: Are you sure you want to Toggle the Borehole Pump?
navigate_to: /lovelace/jojo
```

- **Click pump icon** → Toggle pump with confirmation
- **Hold** → Navigate

### Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `entity_level` | string | **required** | Entity ID for tank level sensor (0-100%) |
| `entity_liters` | string | optional | Entity ID for remaining liters sensor |
| `title` | string | `Jojo` | Label shown below the tank |
| `mode` | string | `compact` | Display mode: `compact` or `full` |
| `pump_entity` | string | optional | Switch entity for pump control |
| `pump_confirmation` | string | `Are you sure...` | Confirmation dialog text |
| `navigate_to` | string | optional | Path to navigate on hold (e.g. `/lovelace/jojo`) |

## How It Works

The card renders a JoJo-style water tank entirely in SVG — no external images needed. The tank body, ribs, dome, lid, gradient fill, animated wave, and pump icon are all vector graphics that scale perfectly at any size.

The fill gradient runs from red (empty) through orange and yellow to green (full), giving an instant visual indication of the tank level. The water surface has an animated wave effect.

When a `pump_entity` is configured, the pump icon (mdi:water-pump) appears inside the tank above the water line. It pulses red when the pump is active and can be tapped/clicked to toggle the pump with a confirmation dialog.

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/hybridrcg)

<img width="167" height="289" alt="Water Tank Full" src="https://github.com/user-attachments/assets/45c38470-89ce-4976-abed-2b2432c42607" />


## License

MIT License - Feel free to use and modify
