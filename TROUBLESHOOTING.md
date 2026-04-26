# Water Tank Card - Troubleshooting Guide

## Quick Diagnostics Checklist

- [ ] Home Assistant version is 2024.1.0 or later
- [ ] Card file exists at: `/config/www/water-tank-card/water-tank-card.js`
- [ ] Resource URL is added to Lovelace config
- [ ] Entity IDs exist in Home Assistant (verify in Developer Tools > States)
- [ ] Images exist at configured paths (verify in File Editor)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Home Assistant frontend reloaded or fully restarted

---

## Common Errors & Solutions

### Error: "Unknown card type: custom:water-tank-card"

**Root Cause:** Home Assistant can't find the custom element registration.

**Solutions (try in order):**

1. **Verify manifest.json has Lovelace declaration**
   ```json
   {
     ...
     "lovelace": {
       "mode": "custom-element"
     }
   }
   ```
   ✓ Our fix includes this.

2. **Check resource URL in dashboard YAML:**
   ```yaml
   resources:
     - url: /local/water-tank-card/water-tank-card.js
       type: module
   ```
   - Open Developer Tools (F12) → Network tab
   - Look for `water-tank-card.js` request
   - Should be 200 (success), not 404 (not found)

3. **Hard refresh browser:**
   - Windows/Linux: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`
   - Or clear all browser cache for `homeassistant.local` (or your HA domain)

4. **Reload Lovelace frontend:**
   - Settings → Developer Tools → YAML
   - Call service: `frontend.reload_themes`
   - Wait 5 seconds, refresh browser

5. **Full Home Assistant restart:**
   - Settings → System → Restart
   - Wait for Home Assistant to fully start (5+ minutes)
   - Test card again

6. **Check browser console for errors:**
   - Press F12 → Console tab
   - Look for red errors mentioning `water-tank-card`
   - Common: "Cannot find module", "Syntax error", "CSS import failed"
   - Share console errors for debugging

---

### Error: Card appears but shows "Entity sensor.xxx not found"

**Root Cause:** Entity ID in card config doesn't exist in Home Assistant.

**Solution:**

1. **Verify entities exist:**
   - Settings → Developer Tools → States
   - Search for your entity names
   - Confirm exact spelling and case (case-sensitive)

2. **Update card config with correct IDs:**
   ```yaml
   type: custom:water-tank-card
   entity_level: sensor.tank_level      # <-- MUST exist in States
   entity_liters: sensor.tank_liters    # <-- MUST exist in States
   title: My Water Tank
   ```

3. **Test entity states:**
   - States page should show state value (e.g., "75.5" for level, "250" for liters)
   - If state is "unknown" or "unavailable", fix the entity/integration first

---

### Error: Images not displaying (shows blank tank)

**Root Cause:** Image paths are wrong or files don't exist.

**Solutions:**

1. **Verify images exist:**
   - Settings → Developer Tools → File Editor
   - Navigate to `/config/www/`
   - Confirm folder `/TANK/` exists
   - Confirm files exist:
     - `water_tank_background_clean.png`
     - `water_fill2.png`

2. **Check image paths in card config:**
   ```yaml
   type: custom:water-tank-card
   background_image: /local/TANK/water_tank_background_clean.png
   fill_image: /local/TANK/water_fill2.png
   ```
   - `/local/` = `/config/www/` (Home Assistant's public web folder)
   - Must be exact filename and path

3. **Debug in browser:**
   - Press F12 → Network tab
   - Filter for "png" or "jpg"
   - Look for image requests
   - If 404: file path is wrong
   - If no request appears: path syntax is invalid

4. **Test image paths manually:**
   - Visit: `http://homeassistant.local:8123/local/TANK/water_tank_background_clean.png`
   - Should display the image
   - If 404: filename or folder path is wrong

5. **Use default paths if unsure:**
   ```yaml
   type: custom:water-tank-card
   entity_level: sensor.tank_level
   entity_liters: sensor.tank_liters
   # Don't specify background_image or fill_image
   # Card will use built-in defaults
   ```

---

### Error: Card appears but doesn't update when sensor changes

**Root Cause:** Entity updates aren't triggering re-renders.

**Solutions:**

1. **Verify entity is updating:**
   - Settings → Developer Tools → States
   - Click on your entity (e.g., `sensor.tank_level`)
   - Check "Last Updated" timestamp
   - Manually trigger an update in your integration to confirm it changes

2. **Check for typos in config:**
   - Copy entity ID directly from States page (avoids typos)
   - Case must match exactly

3. **Restart Home Assistant:**
   - Settings → System → Restart
   - Some integrations need restart to fully load

4. **Monitor card's internal state:**
   - Edit card → View card in Code Mode
   - Should show your config
   - If config is missing keys, card may not update properly

---

### Error: "Failed to parse template" or YAML validation error

**Root Cause:** YAML syntax error in dashboard config.

**Check:**
```yaml
views:
  - title: My Dashboard
    cards:
      - type: custom:water-tank-card
        entity_level: sensor.tank_level    # Make sure indentation is correct
        entity_liters: sensor.tank_liters
```

**Common YAML mistakes:**
- ❌ Incorrect indentation (must be 2 spaces, not tabs)
- ❌ Missing colon after key: `entity_level` ✓ vs `entity_level` ✗
- ❌ Entity IDs not quoted (if they have special chars): `"sensor.tank-level"`
- ❌ Multiline strings need `|` or `>`: 
  ```yaml
  title: |
    Multi
    Line
  ```

**Fix:** Use Dashboard UI editor instead of YAML editor:
- Edit Dashboard → Add Card → Search "Water Tank"
- Fill in fields with UI
- No YAML syntax to worry about

---

### Card loads but styling looks wrong (overlapping text, tiny fonts, etc.)

**Root Cause:** CSS variables not applied or custom styling conflict.

**Solutions:**

1. **Check Home Assistant theme:**
   - Settings → Appearance → Themes
   - Switch to different theme
   - If styling fixes, your custom theme is conflicting

2. **Browser zoom reset:**
   - Press `Ctrl+0` (Cmd+0 on Mac)
   - Default zoom should be 100%

3. **Clear browser cache:**
   - F12 → Application → Storage → Clear site data
   - Refresh page

4. **Check for custom CSS:**
   - Settings → Dashboard → Custom CSS
   - Any custom CSS affecting `.water-tank-card` or card styles?
   - Try temporarily disabling it

---

### Installation Errors (Manual Install)

**Problem:** File structure wrong after manual install

**Correct structure:**
```
/config/
└── www/
    ├── water-tank-card/
    │   └── water-tank-card.js        ← File goes here
    └── TANK/                         ← Optional image folder
        ├── water_tank_background_clean.png
        └── water_fill2.png
```

**If files in wrong location:**
1. Move `water-tank-card.js` to `/config/www/water-tank-card/`
2. Move images to `/config/www/TANK/` (if using custom images)
3. Ensure folder structure matches above
4. Restart Home Assistant

---

### HACS Installation Issues

**Problem:** "Card not found in HACS"

**Solution:**
1. HACS may not auto-discover the repo
2. Add custom repository:
   - HACS → Frontend → ⋮ menu → Custom repositories
   - URL: `https://github.com/HybridRCG/water-tank-card`
   - Category: `Lovelace`
   - Click "Create"
3. Now you can install via HACS

---

## Advanced Debugging

### 1. Enable Developer Mode in Home Assistant

```yaml
# configuration.yaml
logger:
  default: info
  logs:
    homeassistant.components: debug
    homeassistant.core: debug
```

Restart Home Assistant, check logs for errors.

### 2. Check Browser Console Logs

Press F12 in Home Assistant → Console tab

**Look for:**
- Red errors from `water-tank-card`
- Warning about missing entities
- Network 404 errors

**Useful commands in console:**
```javascript
// Check if card is registered
window.customCards
// Should show: [{type: "water-tank-card", ...}, ...]

// Check card element exists
document.querySelector('water-tank-card')
// Should show the element, not null

// Check Home Assistant object is available
document.querySelector('water-tank-card')?.hass
// Should show hass object with states
```

### 3. Check Network Requests

F12 → Network tab:
- Filter for `water-tank-card`
- Verify `.js` file loads (200 status)
- Verify images load (200 status)
- Any 404? File is missing
- Any 403? Permission denied

### 4. Test Config Manually

Add a test card with minimal config:
```yaml
type: custom:water-tank-card
entity_level: sensor.tank_level
entity_liters: sensor.tank_liters
```

If this works, add one feature at a time:
- Add `title`
- Add `background_image`
- Add `fill_image`

Helps identify which config option is breaking.

---

## Getting Help

If you're still stuck:

1. **Collect debug info:**
   - Screenshot of error
   - Full card config (YAML)
   - Entity IDs from States page
   - Home Assistant version (Settings → About)
   - Browser console errors (F12)

2. **Check these resources:**
   - [Home Assistant Custom Card Docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card)
   - [Water Tank Card Issues](https://github.com/HybridRCG/water-tank-card/issues)
   - [Home Assistant Community Forums](https://community.home-assistant.io/)

3. **Report issue with context:**
   - Home Assistant version
   - How you installed (HACS or manual)
   - Full error message
   - Steps to reproduce
   - Card config (sanitize entity IDs if sensitive)

---

## Performance Tips

If card causes Home Assistant to lag:

1. **Limit update frequency:**
   - Entity update interval should be 30+ seconds
   - Don't poll faster than needed

2. **Use fewer cards on one dashboard:**
   - Split into multiple views
   - Only load this card on the view where it's needed

3. **Optimize images:**
   - Use PNG or WebP, not JPEG
   - Compress: use ImageOptim, TinyPNG, or similar
   - Recommended: <100KB per image

4. **Monitor Home Assistant performance:**
   - Settings → System → Logs
   - Look for `slow_turn_on` or performance warnings

---

## Configuration Reference

All config options:

```yaml
type: custom:water-tank-card
entity_level: sensor.tank_level              # REQUIRED: 0-100 percentage
entity_liters: sensor.tank_liters            # REQUIRED: remaining liters
title: "My Water Tank"                       # OPTIONAL: card title
background_image: /local/TANK/bg.png         # OPTIONAL: tank background
fill_image: /local/TANK/fill.png             # OPTIONAL: water fill pattern
```

**Notes:**
- `entity_level` must be a number 0-100 (percent)
- `entity_liters` can be any string/number
- Images must be URLs (http://, https://, or /local/)
- All paths are relative to `/config/www/`

---

## Version Compatibility

| Home Assistant | Card Version | Status |
|---|---|---|
| 2024.1.0+ | 1.0.1 | ✓ Tested |
| 2023.12.x | 1.0.1 | ? Untested |
| 2023.11.x | 1.0.1 | ? Untested |
| < 2023.11 | 1.0.1 | ✗ Not supported |

Requires Home Assistant 2024.1.0 or later for full compatibility with latest custom element features.

---

**Last Updated:** 2026-04-26
**Card Version:** 1.0.1
