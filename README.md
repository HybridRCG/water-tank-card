# Water Tank Card

A custom Home Assistant Lovelace card for displaying water tank levels with smooth animated fill effects.

<img width="145" height="132" alt="Water Tank" src="https://github.com/user-attachments/assets/6d682f7d-7814-48b7-a4d6-9b2bc476cbc3" />

## Features

- 🌊 Animated water fill from bottom up based on sensor value
- 📊 Displays current level percentage and remaining liters
- 🎨 Fully customizable background and fill images
- ⚡ Real-time updates as sensor values change
- 📱 Responsive design that works on mobile and desktop
- 🔧 Easy configuration with YAML

## Installation

### Via HACS (Recommended)

1. Open Home Assistant
2. Go to **HACS** → **Frontend**
3. Click the three dots menu → **Custom repositories**
4. Add: `https://github.com/HybridRCG/water-tank-card`
5. Select **Lovelace** as the category
6. Click **Install**

### Manual Installation

1. Download the `water-tank-card.js` file
2. Place it in your Home Assistant config directory: `/config/www/water-tank-card/`
3. Add this to your dashboard YAML:

```yaml
resources:
  - url: /local/water-tank-card/water-tank-card.js
    type: module
```

## Configuration

### Basic Configuration

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
```

### Full Configuration with Custom Images

```yaml
type: custom:water-tank-card
entity_level: sensor.tank_level
entity_liters: sensor.tank_liters
title: Jojo Water Tank
background_image: /local/TANK/water_tank_background_clean.png
fill_image: /local/TANK/water_fill2.png
```

### Configuration Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | required | Must be `custom:water-tank-card` |
| `entity_level` | string | required | Entity ID of the tank level sensor (0-100%) |
| `entity_liters` | string | required | Entity ID of the remaining liters sensor |
| `title` | string | `Water Tank` | Card title |
| `background_image` | string | `/local/TANK/water_tank_background_clean.png` | Path to tank background image |
| `fill_image` | string | `/local/TANK/water_fill2.png` | Path to water fill image |

## License

MIT License - Feel free to use and modify
