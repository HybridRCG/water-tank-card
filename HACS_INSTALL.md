# Water Tank Card - HACS Installation Guide

**Version:** 1.2.1  
**Status:** ✅ HACS Compatible  
**Date:** 2026-04-26  

---

## ✅ v1.2.1 is NOW HACS Compatible

The repository now has proper HACS configuration:
- ✅ `.hacs.json` metadata file
- ✅ `manifest.json` with correct version (1.2.1)
- ✅ `package.json` with matching version
- ✅ Clean repository structure
- ✅ Proper release tag (v1.2.1)

---

## 🚀 Installation via HACS (Works Now!)

### Step 1: Add Custom Repository
1. Open **Home Assistant**
2. Go to **HACS** → **Frontend**
3. Click **⋮** (three dots menu)
4. Select **Custom repositories**
5. Paste: `https://github.com/HybridRCG/water-tank-card`
6. Category: **Lovelace**
7. Click **Create**

### Step 2: Install the Card
1. Go back to **HACS** → **Frontend**
2. Search for **"Water Tank Card"**
3. Click on the result
4. Click **Install**
5. Wait for installation to complete (~30 seconds)

### Step 3: Restart Home Assistant
1. Go to **Settings** → **System** → **Restart Home Assistant**
2. Wait for restart (~5 minutes)
3. Check that Home Assistant is back online

### Step 4: Add to Dashboard
1. Go to your **Dashboard**
2. Click **Edit** (pencil icon)
3. Click **Add Card**
4. Search for **"Water Tank"**
5. Select **"Water Tank Card"**
6. Configure with your entities:

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level
entity_liters: sensor.jojo_liters_left
title: Water Tank
background_image: /local/TANK/water_tank_background_clean.png
fill_image: /local/TANK/water_fill2.png
```

7. Click **Save**

---

## 📦 What's Included in v1.2.1

✅ **Fixed Fill Height** - Tank fill respects boundaries  
✅ **HACS Metadata** - `.hacs.json` for proper discovery  
✅ **Version Sync** - All files at v1.2.1  
✅ **Minimal Manifest** - HACS-compliant format  
✅ **Release Tag** - Proper Git tag for releases  

---

## 🔍 Verify Installation

After restart, check:

1. **In Home Assistant:**
   - Go to HACS → Frontend
   - "Water Tank Card" should show version 1.2.1
   - No error icons

2. **On Dashboard:**
   - Add card → Search "Water Tank"
   - Card appears in suggestions
   - Can be added and configured

3. **Card Display:**
   - Shows tank with proper fill level
   - Updates in real-time
   - No error messages

---

## 🆘 If Installation Fails

**Problem: Card doesn't appear in HACS**
- Solution: Wait 5 minutes and refresh HACS
- The repository needs to be indexed

**Problem: Installation hangs**
- Solution: Click Install again, or refresh the page
- Check Home Assistant logs for errors

**Problem: Card doesn't load after restart**
- Solution: Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache for homeassistant domain
- Restart Home Assistant again

---

## 📝 Configuration Reference

```yaml
type: custom:water-tank-card
entity_level: sensor.jojo_tank_level_liquid_level    # REQUIRED: Level sensor (0-100%)
entity_liters: sensor.jojo_liters_left               # REQUIRED: Liters sensor
title: Water Tank                                     # OPTIONAL: Card title
background_image: /local/TANK/water_tank_background_clean.png  # OPTIONAL: Tank image
fill_image: /local/TANK/water_fill2.png              # OPTIONAL: Fill pattern
```

---

## ✨ Features

✅ Real-time sensor updates  
✅ Smooth fill animation (0.8s)  
✅ Responsive design (mobile + desktop)  
✅ Multiple sensor value formats supported  
✅ Professional styling  
✅ Custom images support  
✅ No external dependencies  

---

## 📊 Display Example

At 95% tank level:
- **Center text:** "95%"
- **Corner text:** "Remaining: 4750 L"
- **Fill height:** ~80% of visible tank (respects boundaries)
- **Color gradient:** Green → Yellow → Orange → Red

---

## 🔗 Resources

- **GitHub:** https://github.com/HybridRCG/water-tank-card
- **Releases:** https://github.com/HybridRCG/water-tank-card/releases
- **HACS Docs:** https://hacs.xyz/

---

## ✅ Checklist

- [ ] Repository added to HACS custom repositories
- [ ] Card installed via HACS
- [ ] Home Assistant restarted
- [ ] Browser cache cleared
- [ ] Card appears in "Add Card" dialog
- [ ] Card added to dashboard
- [ ] Configuration updated with your entity IDs
- [ ] Card displays correctly
- [ ] Fill level updates in real-time

---

**Status: Production Ready - HACS Compatible ✅**

