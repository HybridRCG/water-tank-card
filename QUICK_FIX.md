# Water Tank Card - Quick Fix Guide

## The Problem
**Error:** "Unknown card type: custom:water-tank-card" in Home Assistant

## The Solution
**Add 4 lines to `manifest.json`:**

```json
"lovelace": {
  "mode": "custom-element"
}
```

### Before:
```json
{
  "name": "Water Tank Card",
  ...
  "version": "1.0.1"
}
```

### After:
```json
{
  "name": "Water Tank Card",
  ...
  "lovelace": {
    "mode": "custom-element"
  },
  "version": "1.0.1"
}
```

## Why This Works

Home Assistant validates your card configuration BEFORE loading JavaScript:
1. Reads `manifest.json` first
2. Looks for `"lovelace"` declaration
3. If found: ✓ Marks card as valid, loads JS
4. If missing: ✗ Rejects card before JS runs
5. JavaScript registration code never executes

## Installation Steps

### Option 1: Fresh Install (Recommended)
1. Delete old `/config/www/water-tank-card/` folder
2. Copy this corrected version
3. Restart Home Assistant
4. Add card to dashboard

### Option 2: Quick Fix (Existing Install)
1. Edit: `/config/www/water-tank-card/manifest.json`
2. Add the `"lovelace"` lines (see above)
3. Restart Home Assistant
4. Dashboard should now find the card

## Verify the Fix

### In Home Assistant:
1. Go to Dashboard → Edit
2. Click "Add card"
3. Search for "Water Tank"
4. Should appear in dropdown ✓

### In Browser Console:
```javascript
window.customCards
// Should show: [{type: "water-tank-card", ...}]
```

### In Home Assistant Logs:
Look for no errors about unknown card types ✓

## Next Steps

1. Configure with your entity IDs:
   ```yaml
   type: custom:water-tank-card
   entity_level: sensor.tank_level
   entity_liters: sensor.tank_liters
   ```

2. Add custom images (optional):
   ```yaml
   background_image: /local/TANK/water_tank_background_clean.png
   fill_image: /local/TANK/water_fill2.png
   ```

3. See **TROUBLESHOOTING.md** for detailed guides

## Files Modified

- ✅ `manifest.json` - Added lovelace declaration
- 📋 `ANALYSIS_AND_FIXES.md` - Full technical analysis
- 📋 `TROUBLESHOOTING.md` - Comprehensive troubleshooting guide

## Support

If you still see errors after this fix:
1. Check browser console (F12)
2. Check Home Assistant logs
3. See **TROUBLESHOOTING.md** for detailed debugging
4. Check entity IDs in Developer Tools > States

---

**Version:** 1.0.1  
**Fixed:** 2026-04-26
