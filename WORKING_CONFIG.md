# Water Tank Card - Working Configuration ✅

**Status:** Fully Functional  
**Date:** 2026-04-26  
**Version:** 1.2.0+

---

## Your Working Configuration

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
background_image: /local/TANK/water_tank_background_clean.png
fill_image: /local/TANK/water_fill2.png
```

---

## What's Working ✅

✅ Tank displays at 95% fill level  
✅ Shows 4750 L remaining  
✅ Smooth color gradient (green → red)  
✅ Real-time sensor updates  
✅ Professional styling and contrast  
✅ Images loading correctly  
✅ Responsive design  

---

## How It Works

**entity_level:** `sensor.jojo_tank_level_liquid_level`
- Provides the tank level (0-100%)
- Controls fill height of the tank
- Displayed as percentage in center

**entity_liters:** `sensor.jojo_liters_left`
- Provides remaining liters
- Displayed in bottom-right corner
- Shows "Remaining: 4750 L"

---

## Sensor Value Parsing

The card automatically handles:
- Numeric values: `95` → `95%`
- Values with units: `4750 L` → shows as `4750 L`
- Percentage format: `95%` → `95%`
- String values: `"95.5"` → `95.5%`

---

## Features

- **Real-time updates** - Changes instantly as sensors update
- **Smooth animation** - 0.8s ease-out transition
- **Responsive** - Works on mobile and desktop
- **Professional styling** - Proper shadows and contrast
- **Error handling** - Shows helpful messages if entities not found

---

## Configuration Complete

Your Water Tank Card is ready to use!

For updates or changes to images/styling, edit this configuration in your Home Assistant dashboard.

